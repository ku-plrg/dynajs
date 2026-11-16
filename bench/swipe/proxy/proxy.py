import hashlib
import os
import sys
import time

# Line-buffered output
sys.stderr = os.fdopen(sys.stderr.fileno(), 'w', 1)
sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 1)

from http.cookies import SimpleCookie
import json
import urllib.request
import urllib.error
import inspect
import traceback
import subprocess
from typing import Optional
from bs4 import BeautifulSoup
from mitmproxy import ctx
from mitmproxy import http
from datetime import datetime, timedelta
from email.utils import parsedate_tz, mktime_tz
from threading import Lock
from io import BytesIO
from pathlib import Path
import atexit
from collections import OrderedDict
import tldextract
import tempfile
import psycopg2
from psycopg2.extras import Json

from urllib.parse import urlparse, urlencode, quote_plus

from mitmproxy.script import concurrent
from warcio.warcwriter import WARCWriter
from warcio.archiveiterator import ArchiveIterator
from warcio.statusandheaders import StatusAndHeaders


filename = inspect.getframeinfo(inspect.currentframe()).filename
JALANGI_HOME = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(filename)), os.pardir))
sys.path.insert(0, JALANGI_HOME + '/scripts')
import sj

class URL(object):
    """
    Represents a URL as a combination of:
    - scheme: str       # e.g., HTTP/S
    - subdomain: str    # From tldextract
    - domain: str       # From tldextract
    - suffix: str       # From tldextract
    - path: str         #
    - query: str        #
    - fragment: str     #
    """
    def __init__(
        self,
        scheme='',
        subdomain='',
        domain='',
        suffix='',
        path='',
        query='',
        params='',
        fragment='',
        port=80
    ):
        self._scheme = scheme
        if 'https' in scheme:
            port = 443
        self._subdomain = subdomain
        self._domain = domain
        self._suffix = suffix
        self._path = path
        self._query = query
        self._params = params
        self._fragment = fragment
        self._port = port
    
    @classmethod
    def from_flow_request(cls, request):
        parts = tldextract.extract(request.host)
        path = cls._parse_flow_path(request.path)
        query = cls._parse_flow_query(request.query)

        # Assumes serialization of URL.from_str is correct
        return URL.from_str(cls(
            scheme=request.scheme,
            subdomain=parts.subdomain,
            domain=parts.domain,
            suffix=parts.suffix,
            path=path,
            query=query,
        ).serialize())

        
    @classmethod
    def from_str(cls, url:str):
        parsed = urlparse(url)
        parts = tldextract.extract(parsed.netloc)
        query = parsed.query
        params = parsed.params #Path params
        if parsed.port is not None:
            port = parsed.port
        else:
            if 'https' in parsed.scheme:
                port = 443
            else:
                port = 80
        return cls(
            scheme=parsed.scheme,
            subdomain=parts.subdomain,
            domain=parts.domain,
            suffix=parts.suffix,
            path=parsed.path,
            query=query,
            params=params,
            fragment=parsed.fragment,
            port=port
        )
    
    @staticmethod
    def _parse_flow_path(path: str) -> str:
        for i, c in enumerate(path):
            if c == '#' or c == '?':
                return path[:i]
        return path
    
    @staticmethod
    def _parse_flow_query(query) -> dict:
        _query = {}
        for k, v in query.items():
            _query[k] = v
        return urlencode(_query, quote_via=quote_plus, errors='ignore')
    
    def scheme(self) -> str:
        return self._scheme
    
    def subdomain(self) -> str:
        return self._subdomain

    def eTLD(self) -> str:
        out = ''
        if self._subdomain:
            out += f'{self._subdomain}.'
        out += self._domain
        if self._suffix:
            out += f'.{self._suffix}'
        return out
    
    def path(self) -> str:
        return self._path
    
    def query(self) -> str:
        return self._query
    
    def params(self) -> str:
        return self._params

    def query_to_dict(self) -> dict:
        _query = {}
        for pair in self._query.split('&'):
            if '=' in pair:
                parts = pair.split('=')
                _query[parts[0]] = parts[1]
            elif pair != '':
                _query[pair] = ''
        return _query

    def filetype(self) -> Optional[str]:
        if '.' in self._path:
            return '.'.join(self._path.split('.')[1:])
        return None
    
    def serialize(self, include=['scheme', 'eTLD', 'path', 'params', 'query', 'fragment', 'port']) -> str:
        out = ''
        if 'scheme' in include:
            out += f'{self._scheme}://'
        if 'eTLD' in include:
            out += self.eTLD()
        if 'port' in include:
            out += f':{self._port}'
        if 'path' in include:
            out += self._path
        if 'params' in include and self._params != '':
            out += f';{self._params}'
        if 'query' in include and self._query != '':
            out += f'?{self._query}'
        if 'fragment' in include and self._fragment != '':
            out += f'#{self._fragment}'
        return out

    def to_JSON(self) -> object:
        return {
            'scheme': self._scheme,
            'subdomain': self._subdomain,
            'domain': self._domain,
            'suffix': self._suffix,
            'path': self._path,
            'query': self._query,
            'params': self._params,
            'fragment': self._fragment,
        }
    
    def archive_name(self) -> str:
        """
        Create the archive name using a hash of the
        startCrawl URL.
        """
        url = self.serialize(include=['scheme', 'eTLD', 'path', 'port'])
        print(f'Generating archive name for URL: {url}')
        url_hash = hashlib.sha256()
        url_hash.update(url.encode('UTF-8'))
        return url_hash.hexdigest()
    
    def __repr__(self) -> str:
        return self.serialize()


# constants
POSTGRES_HOST = os.getenv('POSTGRES_HOST')
POSTGRES_DB = os.getenv('POSTGRES_DB')
POSTGRES_ARCHIVAL_DB = os.getenv('POSTGRES_ARCHIVAL_DB')
POSTGRES_USER = os.getenv('POSTGRES_USER')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
POSTGRES_PORT = os.getenv('POSTGRES_PORT')

archival_db_params = f"host={POSTGRES_HOST} dbname={POSTGRES_ARCHIVAL_DB} port={POSTGRES_PORT}\
    user={POSTGRES_USER} password={POSTGRES_PASSWORD}"

db_params = f"host={POSTGRES_HOST} dbname={POSTGRES_DB} port={POSTGRES_PORT}\
    user={POSTGRES_USER} password={POSTGRES_PASSWORD}"

DATABASE_MODE = False
CACHE_FOLDER = 'cache'

if POSTGRES_HOST is not None:
    DATABASE_MODE = True
    CACHE_FOLDER = '/persist/cache'

inserted_items = {} #To minimize number of INSERT queries


def trim_dummy(url):
    url = url.replace('#dummy', '')
    url = url.replace('dummy=dummy', '')
    return url

class ArchiveStorage(object):
    """"
    Maps disk locations to archives.
    Performs lookup of archive based on eTLD+1 and path.

    Store structure:
    {
        eTLD: {
            path1: archive_path,
            path2: ...,
        },
        eTLD2: ...,
    }
    """
    
    def __init__(self, store_path: Path):
        if DATABASE_MODE:
            print(f'The archive store is in the DB')
            self._store = self._read_store_db()
        else:
            self._store_path = store_path / 'archive_store.json'
            print(f'The archive store is at {self._store_path}')
            self._store = self._read_store()
    
    def _read_store(self):
        if not self._store_path.exists():
            return {}
        try:
            with open(self._store_path, 'r') as store_f:
                data = store_f.read()
                if not data:
                    return {}
                return json.loads(data)
        except Exception as exn:
            raise Exception(f'Failed to read archive store:\n{exn}')
    
    def _write_store(self):
        try:
            data = json.dumps(self._store)
            with open(self._store_path, 'w') as store_f:
                store_f.write(data)
        except Exception as exn:
            raise Exception(f'Failed to write archive store:\n{exn}')

    def _read_store_db(self):
        conn = psycopg2.connect(archival_db_params)
        cur = conn.cursor()
        cur.execute("SELECT * FROM Archive_Lookup;")
        results = cur.fetchall()
        conn.close()

        ret = {}
        for etld, path, hashs, _ in results:
            if etld not in ret:
                ret[etld] = {}
            ret[etld][path] = hashs
        return ret
    
    def _write_store_db(self):
        triplets = []
        for etlds in self._store:
            for paths in self._store[etlds]:
                hashs = self._store[etlds][paths]
                triplets.append((etlds, paths, hashs))

        conn = psycopg2.connect(archival_db_params)
        cur = conn.cursor()

        for etld, path, hashs in triplets:
            if (etld, path, hashs) in inserted_items:
                continue 
            inserted_items[etld, path, hashs] = True


            cur.execute('INSERT INTO Archive_Lookup VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING', [etld, path, hashs, 'non_instrumented'])
            conn.commit()
        
        conn.close()


    def store_archive(self, url: URL, archive_path: Path):
        eTLD = url.eTLD()
        path = url.path()
        if eTLD not in self._store:
            self._store[eTLD] = {}
        self._store[eTLD][path] = str(archive_path)

        if DATABASE_MODE:
            self._write_store_db()
        else:
            self._write_store()

    def load_archive(self, url: URL) -> Path:
        eTLD = url.eTLD()
        path = url.path()
        archive_path_str = None
        found_eTLD = None
        if eTLD in self._store:
            found_eTLD = eTLD
        # Possibly apply www subdomain heuristic
        elif url.subdomain() == '' and 'www.' + eTLD in self._store:
            found_eTLD = 'www.' + eTLD
        if found_eTLD:
            if path in self._store[found_eTLD]:
                archive_path_str = self._store[found_eTLD][path]
            # Possibly apply trailing slash heuristic
            elif (path + '/') in self._store[found_eTLD]:
                archive_path_str = self._store[found_eTLD][path + '/']
            elif '' in self._store[found_eTLD]:
                print(f'Defaulting to root path archive for URL: {url}')
                archive_path_str = self._store[found_eTLD]['']
            elif '/' in self._store[found_eTLD]:
                print(f'Defaulting to root path archive for URL: {url}')
                archive_path_str = self._store[found_eTLD]['/']
        if not archive_path_str:
            raise Exception(f'No archive found for URL: {url}')
        return Path(archive_path_str)


class Archive(object):
    """
    Archiver that records WARC 1.1 format archives of pages
    that are loaded by the proxy.
    """

    def __init__(self):
        self.archive_store = None
        self.writer = None
        self.warc_handle = None
        self.archive_root_url = None
        self.page_id = 0
        atexit.register(self.cleanup)

    def load(self, loader):
        loader.add_option(
            name = "warcPath",
            typespec = str,
            default= '',
            help = 'Path to store web archive of visited sites. Enables archiving.'
        )

    def cleanup(self):
        """
        Clean up the archive file handle
        if it is still open.
        """
        if self.warc_handle:
            self.warc_handle.close()
    
    def should_archive(self, flow):
        return self.warc_handle is not None and flow.request.headers.get(b'shouldNotArchive', None) is None
    
    def new_archive(self, url: URL):
        """
        Initialize a new archive per new host.

        Invariant: self.warc_handle is not None 
                <==> self.page_id is not None
                <==> self.writer is not None
        
        Assumption: Hosts are not visited more 
        than once per archiving crawl.
        """
        print(f'Initializing new archive for {url.serialize()}')
        self.archive_root_url = url

        # Set up the archive store
        if self.archive_store is None:
            self.archive_store = ArchiveStorage(Path(ctx.options.warcPath))
        # Close the current file handle if it exists
        if self.warc_handle is not None:
            self.warc_handle.close()

        # Create a new file handle for the archive
        archive_name = url.archive_name()
        print(f'The archive name is {archive_name}')
        warc_path = Path(ctx.options.warcPath) / f'{archive_name}.warc.gz'
        self.archive_store.store_archive(url, warc_path)
        # Initialize a new archive
        self.warc_handle = open(warc_path, 'wb')
        self.writer = WARCWriter(self.warc_handle, gzip=True)
        info = OrderedDict([
            ('software', 'Proxy-Archiver-0.1'),
            ('format', 'WARC File Format 1.1'),
            ('isPartOf', 'Google'),
        ])
        self.writer.create_warcinfo_record(warc_path, info)
        # Assign a new page ID for this visit
        self.page_id += 1
    
    def archive_request(self, flow):
        """
        Archive a request to the given URL.
        """
        url = URL.from_flow_request(flow.request)
        if self.writer is None:
            return
        try:
            print(f'Archiving request for {url.serialize()}')
            warc_headers = {
                'WARC-Page-ID': str(self.page_id)
            }
            headers_list = flow.request.headers.items()
            protocol = flow.request.http_version
            method = flow.request.method
            http_headers = StatusAndHeaders(f'{method} / {protocol}', headers_list, is_http_request=True)
            record = self.writer.create_warc_record(
                url.serialize(),
                'request',
                http_headers=http_headers,
                warc_headers_dict=warc_headers,
            )
            self.writer.write_record(record)
        except Exception as exn:
            print(f'Failed to archive request: {exn}')
    
    def archive_response(self, flow):
        """
        Archive a response from the requested URL.
        """
        url = URL.from_flow_request(flow.request)
        if self.writer is None:
            print(f'Not archiving request for {url.serialize()}')
            return
        try:
            print(f'Archiving response for {url.serialize()}')

            warc_headers = {
                'WARC-Page-ID': str(self.page_id)
            }
            status = str(flow.response.status_code)
            protocol = flow.response.http_version
            headers_list = flow.response.headers.items()
            http_headers = StatusAndHeaders(status, headers_list, protocol=protocol)
            payload_raw = flow.response.content
            record = self.writer.create_warc_record(
                url.serialize(),
                'response',
                payload= BytesIO(payload_raw),
                http_headers=http_headers,
                warc_headers_dict=warc_headers,
            )
            self.writer.write_record(record)
            # If this was a redirect for the root URL
            # create a new archive store entry for it
            if self.archive_root_url.path() == '/':
                archive_root_url = self.archive_root_url.serialize(include=['scheme', 'eTLD'])
            else:
                archive_root_url = self.archive_root_url.serialize(include=['scheme', 'eTLD', 'path'])
            if url.path() == '/':
                comparison_url = url.serialize(include=['scheme', 'eTLD'])
            else:
                comparison_url = url.serialize(include=['scheme', 'eTLD', 'path'])
            if (
                # See https://en.wikipedia.org/wiki/URL_redirection#HTTP_status_codes_3xx
                flow.response.status_code in [300, 301, 302, 303, 307, 308] and 
                comparison_url == archive_root_url
            ):
                redirect_location = URL.from_str(flow.response.headers['Location'])
                print(f'Storing archive path for root URL redirect: {redirect_location}')
                original_archive_path = self.archive_store.load_archive(self.archive_root_url)
                self.archive_store.store_archive(redirect_location, original_archive_path)

            #Return stored response, not original response, just like during Replay
                # This is done because there might be differences between stored and original responses
            
            record.raw_stream.seek(0) 

            status = 502
            headers = {}
            if record.http_headers is not None:
                status = int(record.http_headers.statusline)
                headers = {x[0]: x[1] for x in record.http_headers.headers}
            parsed_record = {
                "status": status,
                "headers": headers,
                "payload": record.content_stream().read(),
            }
            flow.response = http.Response.make(
                parsed_record['status'],
                parsed_record['payload'],
                parsed_record['headers'],
            )
            record.raw_stream.seek(0)
        except Exception as exn:
            print(f'Failed to archive response: {exn}')

    def request(self, flow):
        if flow.request.host == '240.240.240.240':
            print(f'Start crawl request.\nQuery:{flow.request.query}')
            target_url = URL.from_str(str(flow.request.query['target']))
            self.new_archive(target_url)
            # Redirect to the target URL
            print(f'Redirecting to target: {target_url}')
            flow.response = http.Response.make(
                301,
                '',
                {'Location': target_url.serialize()}
            )

        elif self.writer is None and (flow.request.host in ['www.gstatic.com', 'accounts.google.com', 'optimizationguide-pa.googleapis.com']):
            flow.response = http.Response.make(404)

        elif self.should_archive(flow):
            self.archive_request(flow)

    def response(self, flow):
        if self.should_archive(flow):
            self.archive_response(flow)

class RevisitCounter(dict):
    """
    Counter that provides an index
    that automatically increments on
    access.
    """

    def __init__(self):
        self._counter = {}
    
    def __getitem__(self, name: str) -> int:
        if name not in self._counter:
            self._counter[name] = 0
        idx = self._counter[name]
        self._counter[name] += 1
        return idx


class Replay(object):
    """
    Archive replayer that responds to browser requests with
    responses from a WARC 1.1 format archive.
    """

    def __init__(self):
        # Archive storeage lookup
        self.archive_store = None
        # Archive root URL
        self.archive_root_url = None

        # Archive root URL, not canonic
        self.accessed_url = None

        # A map from URL to requests
        self.request_map = None
        # A counter of visits to each URL
        self.revisit_counter = None
        # A map from eTLD to set of URLs
        self.eTLD_map = None
        # Execution type
        self.exec_type = None

        # Information to make permanent on DB
        self.info_to_store = {}

    def load(self, loader):
        loader.add_option(
            name = "warcPath",
            typespec = str,
            default= '',
            help = 'Path to read web archive of visited sites.'
        )
        loader.add_option(
            name = 'replayNearest',
            typespec = bool,
            default = False,
            help = 'Replay the nearest neighbor of an unarchived request.'
        )
        loader.add_option(
            name = 'offlineMode',
            typespec = bool,
            default = False,
            help = 'Allow for replaying archives without a network connection'
        )
    
    def should_replay(self):
        return self.request_map is not None

    def init_archive(self, url: URL):
        """
        Initialize the replay with an archive 
        for the given host.
        """
        print(f'Attempting load of archive for URL: {url}')

        # Load the archive store
        if self.archive_store is None:
            self.archive_store = ArchiveStorage(Path(ctx.options.warcPath))
        # Clear any existing archive data
        self.request_map = None 
        self.eTLD_map = None
        # Load the requested archive
        archive_result = self.read_archive(url)
        if archive_result:
            self.request_map, self.eTLD_map = archive_result
            self.revisit_counter = RevisitCounter()
            print(f'Archive loaded for URL: {url}')
        else:
            raise Exception(f'Could not load archive for URL: {url}')
    
    def read_archive(self, url: URL):
        """
        Parse a WARC archive on disk and store a mapping
        of request URLs to responses.
        """
        archive_path = self.archive_store.load_archive(url)
        if not archive_path.exists():
            print(f'No archive found for URL: {url}')
            return None
        request_map = {}
        eTLD_map = {}
        with open(archive_path, 'rb') as stream:
            try:
                for record in ArchiveIterator(stream):
                    try:
                        if record.rec_type == 'warcinfo':
                            print(f'Loading archive for URL: {url}')
                        elif record.rec_type == 'response':
                            req_url = URL.from_str(record.rec_headers.get_header('WARC-Target-URI'))
                            # Add the URL to the eTLD map 
                            eTLD = req_url.eTLD()
                            if eTLD in eTLD_map:
                                eTLD_map[eTLD].add(req_url.serialize())
                            else:
                                eTLD_map[eTLD] = set([req_url.serialize()])
                            # Add the parsed record to the request map

                            status = 502
                            headers = {}
                            if record.http_headers is not None:
                                status = int(record.http_headers.statusline)
                                headers = {x[0]: x[1] for x in record.http_headers.headers}

                            parsed_record = {
                                "status": status,
                                "headers": headers,
                                "payload": record.content_stream().read(),
                            }
                            if req_url.serialize() not in request_map:
                                request_map[req_url.serialize()] = [parsed_record]
                            else:
                                request_map[req_url.serialize()].append(parsed_record)
                    except Exception as exn:
                        print(f'Failed to parse record: {exn}')
            except Exception as exn:
                print(f'Failed to parse part of, or full webarchive: {exn}')

        return request_map, eTLD_map

    def stem_nearest_neighbor(self, url: URL) -> Optional[URL]:
        """
        Find the closest URL in the archive for the
        given URL. This may not be possible.

        Finds a matching URL with stemming:
        url1?suffix1 == url2?suffix2 if url1 == url2
        """
        archived_urls = list(self.request_map.keys())
        stemmed_url = url.serialize(include=['eTLD', 'path'])
        for archived_url in archived_urls:
            archived_url = URL.from_str(archived_url)
            stemmed_archived_url = archived_url.serialize(include=['eTLD', 'path'])
            if stemmed_url == stemmed_archived_url:
                return archived_url
        return None
    
    def levenshtein(self, s1, s2) -> int:
        """
        Computes the Levenshtein distance (edit distance)
        between two strings.

        Source: https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#Python
        """
        if len(s1) < len(s2):
            return self.levenshtein(s2, s1)
        if len(s2) == 0:
            return len(s1)
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        return previous_row[-1]

    def edit_nearest_neighbor(self, url: URL) -> Optional[URL]:
        """
        Find the closest URL in the archive for the
        given URL. This may not be possible.

        Finds a matching URL with minimum edit distance:
        url3 s.t. forall url2 in request_map, 
            edit(url2, url) >= edit(url3, url)

        Note: The eTLD+1 of url3 and url *must*
        also match.
        """

        url_serialized = url.serialize()
        url_serialized = trim_dummy(url_serialized)

        url_eTLD = url.serialize(include=['eTLD'])
        if url_eTLD not in self.eTLD_map:
            return None
        candidates = self.eTLD_map[url_eTLD]
        max_edit_distance = max([len(str(url))] + [len(c) for c in candidates])
        min_edit = (max_edit_distance, None)
        for candidate in candidates:
            candidate_serialized = trim_dummy(candidate)
            candidate_url = URL.from_str(candidate)
            edit_distance = self.levenshtein(candidate_serialized, url_serialized)
            if edit_distance < min_edit[0] and self.check_neighbor(url, candidate_url):
                min_edit = (edit_distance, candidate_url)

        return min_edit[1]

    def semantic_nearest_neighbor(self, url: URL) -> Optional[URL]:
        """
        Find the nearest neighbor by matching URLs
        that have the same eTLD+1 and the same query parameters.

        Among URLs that share the same query parameters,
        the first found URL is returned.
        """
        url_eTLD = url.serialize(include=['eTLD'])
        if url_eTLD not in self.eTLD_map:
            return None
        query_parameters1 = url.query_to_dict()
        candidates = self.eTLD_map[url_eTLD]
        for candidate in candidates:
            candidate = URL.from_str(candidate)
            query_parameters2 = candidate.query_to_dict()
            if query_parameters1 == query_parameters2 and self.check_neighbor(url, candidate):
                return candidate
        return None

    def nearest_neighbor(self, url: URL, algo='edit') -> Optional[URL]:
        """
        Get the response corresponding to the nearest
        neighbor of the given URL.

        The nearest neighbor is either computed with:
        - stemming (algo='stem')
        - Levenshtein distance (algo='edit')
        - Matching query parameters (algo='semantic')
        """
        if algo == 'edit':
            return self.edit_nearest_neighbor(url)
        elif algo == 'stem':
            return self.stem_nearest_neighbor(url)
        elif algo == 'semantic':
            return self.semantic_nearest_neighbor(url)
        else:
            raise Exception(f'Unsupported nearest neighbor algorithm: {algo}')

    def retrieve_response(self, url: URL, rtype='archived'):
        """
        Retrieve a response from the request map for 
        the given URL.
        """
        url = url.serialize()
        count_revisits = self.revisit_counter[url]

        idx = min(count_revisits, len(self.request_map[url]) - 1)
        print(f'Loading {rtype} response for URL: {idx}@{url}')
        archived_response = self.request_map[url][idx]
        return archived_response

    def check_neighbor(self, request_url: URL, neighbor_url: URL) -> bool:
        """
        Ensure that the found neighbor URL matches conditions:
        - File extensions must match
        """
        requested_ext = request_url.filetype()
        neighbor_ext = neighbor_url.filetype()

        if requested_ext != neighbor_ext:
            return False
        return True

    def request(self, flow):
        request_time = time.time()
        url = URL.from_flow_request(flow.request) # Requested URL
        request_identifier = f'{request_time}:{url}'
        
        if ctx.options.offlineMode:
            flow.request.scheme = 'http'
        if flow.request.host == '240.240.240.240':
            target_url = URL.from_str(flow.request.query['target'])
            self.accessed_url = flow.request.query['target'] # Original URL accessed, not canonicalized
            self.archive_root_url = target_url.serialize(include=['scheme', 'eTLD', 'path'])
            self.exec_type = flow.request.query['type']
            print(f'Initializing archive replay for {target_url} with exec type <{self.exec_type}>')
            self.init_archive(target_url)
            flow.response = http.Response.make(
                301,
                '',
                {'Location': target_url.serialize()}
            )

            # Root URL
            self.info_to_store[request_identifier] = target_url.serialize()

        elif self.archive_store is None and (flow.request.host in ['www.gstatic.com', 'accounts.google.com', 'optimizationguide-pa.googleapis.com']):
            flow.response = http.Response.make(404)
            self.info_to_store[request_identifier] = 'noise'

        elif self.should_replay():
            found_archived_response = (False, 'host')
            # First try to look up the URL in the request map
            if url.serialize() in self.request_map:
                archived_response = self.retrieve_response(url, 'archived')
                flow.response = http.Response.make(
                    archived_response['status'],
                    archived_response['payload'],
                    archived_response['headers'],
                )
                found_archived_response = (True, 'directly')
                self.info_to_store[request_identifier] = 'archived'

            # Fallback: If enabled return the nearest neighbor response
            elif ctx.options.replayNearest:
                print(f'Trying to find neighbor of URL: {url}')
                neighbor_url: URL = self.nearest_neighbor(url, 'edit')
                if neighbor_url and self.check_neighbor(url, neighbor_url):
                    archived_response = self.retrieve_response(neighbor_url, 'neighbor')
                    flow.response = http.Response.make(
                        archived_response['status'],
                        archived_response['payload'],
                        archived_response['headers'],
                    )
                    print(f'Neighbor: {neighbor_url}')
                    found_archived_response = (True, 'neighbor')
                    self.info_to_store[request_identifier] = str(neighbor_url)
                    
                elif self.exec_type == 'dse':
                    url_path = url.serialize(include=['scheme', 'eTLD', 'path'])
                    if url_path == self.archive_root_url:
                        archived_response = self.retrieve_response(URL.from_str(url_path), 'archived')
                        flow.response = http.Response.make(
                            archived_response['status'],
                            archived_response['payload'],
                            archived_response['headers'],
                        )
                        print(f'DSE: {url_path}')
                        found_archived_response = (True, 'DSE')
                        self.info_to_store[request_identifier] = str(url_path)
                    else:
                        found_archived_response = (False, 'DSE')
                        self.info_to_store[request_identifier] = 'DSE'
                else:
                    found_archived_response = (False, 'neighbor')
                    self.info_to_store[request_identifier] = 'OOB'
            else:
                found_archived_response = (False, 'URL')
                self.info_to_store[request_identifier] = 'OOB'
            # We didn't have an archive response for this host / URL
            if not found_archived_response[0]:
                flow.response = http.Response.make(404)
                print(f'Out of bounds {found_archived_response[1]} for URL: {url}')

        else:
            print('No archive loaded. Returning 404.')
            flow.response = http.Response.make(404)
            self.info_to_store[request_identifier] = 'archive_not_loaded'

    def client_disconnected(self, client):
        ''' Used to flush some useful data about the current crawl '''
        if DATABASE_MODE:
            if self.exec_type is not None and self.accessed_url is not None:
                info = Json(self.info_to_store)

                # Store accessed URLs and number of OOBs in DB
                conn = psycopg2.connect(db_params)
                cur = conn.cursor()
                cur.execute('''INSERT INTO proxy_logs (origin, condition, request_info)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (origin, condition) DO NOTHING;''', [self.accessed_url, self.exec_type, info])
                conn.commit()
                conn.close()

    def http_connect(self, flow):
        if ctx.options.offlineMode:
            flow.response = http.Response.make(200)




class Append(object):
    """
    Archive replayer that responds to browser requests with
    responses from a WARC 1.1 format archive.
        It tries to load an archive if it exists. Otherwise, it considers an empty archive
    
    """

    def __init__(self):
        # Archive storeage lookup
        self.archive_store = None
        # Archive root URL
        self.archive_root_url = None

        # Archive root URL, not canonic
        self.accessed_url = None

        # A map from URL to requests
        self.request_map = None
        # A counter of visits to each URL
        self.revisit_counter = None
        # A map from eTLD to set of URLs
        self.eTLD_map = None
        # Execution type
        self.exec_type = None

        # Information to make permanent on DB
        self.info_to_store = {}

        # Archival stuff
        atexit.register(self.cleanup)

        self.writer = None
        self.warc_handle = None
        self.page_id = 0

    def load(self, loader):
        loader.add_option(
            name = "warcPath",
            typespec = str,
            default= '',
            help = 'Path to read web archive of visited sites.'
        )
    
    def cleanup(self):
        """
        Clean up the archive file handle
        if it is still open.
        """
        if self.warc_handle:
            self.warc_handle.close()
    
    def should_archive(self, flow):
        return self.warc_handle is not None and flow.request.headers.get(b'shouldNotArchive', None) is None and not getattr(flow, 'custom_response', False)
   
    def should_replay(self):
        return self.request_map is not None

    def init_archive(self, url: URL):
        """
        Initialize with an archive 
        for the given host.
        """
        print(f'Attempting load of archive for URL: {url}')

        # Load the archive store
        if self.archive_store is None:
            self.archive_store = ArchiveStorage(Path(ctx.options.warcPath))

        # Close the current file handle if it exists
        if self.warc_handle is not None:
            self.warc_handle.close()

        # Clear any existing archive data
        self.request_map = None 
        self.eTLD_map = None

        # Create a new file handle for the archive
        archive_name = 'current'
        if not os.path.exists(f'{ctx.options.warcPath}/{archive_name}.warc.gz'):
            archive_name = url.archive_name()
        print(f'The archive name is {archive_name}')
        warc_path = Path(ctx.options.warcPath) / f'{archive_name}.warc.gz'

        # Load the requested archive
        archive_result = self.read_archive(url, warc_path)
        self.revisit_counter = RevisitCounter()
        
        if archive_result:
            self.request_map, self.eTLD_map = archive_result

            self.warc_handle = open(warc_path, 'ab')
            self.writer = WARCWriter(self.warc_handle, gzip=True)

            print(f'Archive loaded for URL: {url}')
        else:
            self.archive_store.store_archive(url, warc_path)

            self.request_map = {}
            self.eTLD_map = {}

            # Initialize a new archive
            self.warc_handle = open(warc_path, 'wb')
            self.writer = WARCWriter(self.warc_handle, gzip=True)
            info = OrderedDict([
                ('software', 'Proxy-Archiver-0.1'),
                ('format', 'WARC File Format 1.1'),
                ('isPartOf', 'Google'),
            ])
            self.writer.create_warcinfo_record(warc_path, info)
            print(f'Archive created for URL: {url}')

        # Assign a new page ID for this visit
        self.page_id += 1

    def read_archive(self, url: URL, archive_path: Path):
        """
        Parse a WARC archive on disk and store a mapping
        of request URLs to responses.
        """

        if not archive_path.exists():
            print(f'No archive found for URL: {url}, creating new one...')
            return None
        
        request_map = {}
        eTLD_map = {}
        with open(archive_path, 'rb') as stream:
            try:
                for record in ArchiveIterator(stream):
                    try:
                        if record.rec_type == 'warcinfo':
                            print(f'Loading archive for URL: {url}')
                        elif record.rec_type == 'response':
                            req_url = URL.from_str(record.rec_headers.get_header('WARC-Target-URI'))
                            # Add the URL to the eTLD map 
                            eTLD = req_url.eTLD()
                            if eTLD in eTLD_map:
                                eTLD_map[eTLD].add(req_url.serialize())
                            else:
                                eTLD_map[eTLD] = set([req_url.serialize()])
                            # Add the parsed record to the request map

                            status = 502
                            headers = {}
                            if record.http_headers is not None:
                                status = int(record.http_headers.statusline)
                                headers = {x[0]: x[1] for x in record.http_headers.headers}

                            parsed_record = {
                                "status": status,
                                "headers": headers,
                                "payload": record.content_stream().read(),
                            }
                            if req_url.serialize() not in request_map:
                                request_map[req_url.serialize()] = [parsed_record]
                            else:
                                request_map[req_url.serialize()].append(parsed_record)
                    except Exception as exn:
                        print(f'Failed to parse record: {exn}')
            except Exception as exn:
                print(f'Failed to parse part of, or full webarchive: {exn}')

        return request_map, eTLD_map
    
    def retrieve_response(self, url: URL, rtype='archived'):
        """
        Retrieve a response from the request map for 
        the given URL.
        """
        url = url.serialize()
        idx = self.revisit_counter[url]
        if idx >= len(self.request_map[url]):
            return None # We need to archive this extra request to the same URL
        print(f'Loading {rtype} response for URL: {idx}@{url}')
        archived_response = self.request_map[url][idx]
        return archived_response


    def request(self, flow):
        request_time = time.time()
        url = URL.from_flow_request(flow.request) # Requested URL
        request_identifier = f'{request_time}:{url}'
        
        if flow.request.host == '240.240.240.240':
            target_url = URL.from_str(flow.request.query['target'])
            self.accessed_url = flow.request.query['target'] # Original URL accessed, not canonicalized
            self.archive_root_url = target_url
            self.exec_type = flow.request.query['type']
            print(f'Initializing archive replay for {target_url} with exec type <{self.exec_type}>')
            self.init_archive(target_url)
            flow.response = http.Response.make(
                301,
                '',
                {'Location': target_url.serialize()}
            )
            flow.custom_response = True

            # Root URL
            self.info_to_store[request_identifier] = target_url.serialize()

        elif self.archive_store is None and (flow.request.host in ['www.gstatic.com', 'accounts.google.com', 'optimizationguide-pa.googleapis.com']):
            flow.response = http.Response.make(404)
            flow.custom_response = True
            self.info_to_store[request_identifier] = 'noise'

        elif self.should_replay():
            found_archived_response = (False, 'host')
            # First try to look up the URL in the request map
            if url.serialize() in self.request_map and (archived_response := self.retrieve_response(url, 'archived')) is not None:
                flow.response = http.Response.make(
                    archived_response['status'],
                    archived_response['payload'],
                    archived_response['headers'],
                )
                flow.custom_response = True
                found_archived_response = (True, 'directly')
                self.info_to_store[request_identifier] = 'archived'

            else:
                self.info_to_store[request_identifier] = 'appended'
                if self.should_archive(flow):
                    self.archive_request(flow)
                # Not changing flow.response to connect to website
        else:
            print('No archive loaded. Returning 404.')
            flow.response = http.Response.make(404)
            flow.custom_response = True
            self.info_to_store[request_identifier] = 'archive_not_loaded'

    def response(self, flow):
        if self.should_archive(flow):
            self.archive_response(flow)

    def client_disconnected(self, client):
        ''' Used to flush some useful data about the current crawl '''
        if DATABASE_MODE:
            if self.exec_type is not None and self.accessed_url is not None:
                info = Json(self.info_to_store)

                # Store accessed URLs and number of OOBs in DB
                conn = psycopg2.connect(db_params)
                cur = conn.cursor()
                cur.execute('''INSERT INTO proxy_logs (origin, condition, request_info)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (origin, condition) DO NOTHING;''', [self.accessed_url, self.exec_type, info])
                conn.commit()
                conn.close()
        elif self.exec_type is not None and self.accessed_url is not None:
            with open('/tmp/request_info.json', 'w') as f:
                json.dump(self.info_to_store, f)

    def archive_request(self, flow):
        """
        Archive a request to the given URL.
        """
        url = URL.from_flow_request(flow.request)
        if self.writer is None:
            return
        try:
            print(f'Archiving request for {url.serialize()}')
            warc_headers = {
                'WARC-Page-ID': str(self.page_id)
            }
            headers_list = flow.request.headers.items()
            protocol = flow.request.http_version
            method = flow.request.method
            http_headers = StatusAndHeaders(f'{method} / {protocol}', headers_list, is_http_request=True) # FIXME - Does it make sense to have is_http_request=True always?
            record = self.writer.create_warc_record(
                url.serialize(),
                'request',
                http_headers=http_headers,
                warc_headers_dict=warc_headers,
            )
            self.writer.write_record(record)
        except Exception as exn:
            print(f'Failed to archive request: {exn}')


    def archive_response(self, flow):
        """
        Archive a response from the requested URL.
        """
        url = URL.from_flow_request(flow.request)
        if self.writer is None:
            print(f'Not archiving request for {url.serialize()}')
            return
        try:
            print(f'Archiving response for {url.serialize()}')

            warc_headers = {
                'WARC-Page-ID': str(self.page_id)
            }
            status = str(flow.response.status_code)
            protocol = flow.response.http_version
            headers_list = flow.response.headers.items()
            http_headers = StatusAndHeaders(status, headers_list, protocol=protocol)
            payload_raw = flow.response.content
            record = self.writer.create_warc_record(
                url.serialize(),
                'response',
                payload= BytesIO(payload_raw),
                http_headers=http_headers,
                warc_headers_dict=warc_headers,
            )
            self.writer.write_record(record)
            # If this was a redirect for the root URL
            # create a new archive store entry for it
            if self.archive_root_url.path() == '/':
                archive_root_url = self.archive_root_url.serialize(include=['scheme', 'eTLD'])
            else:
                archive_root_url = self.archive_root_url.serialize(include=['scheme', 'eTLD', 'path'])
            if url.path() == '/':
                comparison_url = url.serialize(include=['scheme', 'eTLD'])
            else:
                comparison_url = url.serialize(include=['scheme', 'eTLD', 'path'])
            if (
                # See https://en.wikipedia.org/wiki/URL_redirection#HTTP_status_codes_3xx
                flow.response.status_code in [300, 301, 302, 303, 307, 308] and 
                comparison_url == archive_root_url
            ):
                redirect_location = URL.from_str(flow.response.headers['Location'])
                print(f'Storing archive path for root URL redirect: {redirect_location}')
                original_archive_path = self.archive_store.load_archive(self.archive_root_url)
                self.archive_store.store_archive(redirect_location, original_archive_path)

            #Return stored response, not original response, just like during Replay
                # This is done because there might be differences between stored and original responses
            
            record.raw_stream.seek(0) 

            status = 502
            headers = {}
            if record.http_headers is not None:
                status = int(record.http_headers.statusline)
                headers = {x[0]: x[1] for x in record.http_headers.headers}
            parsed_record = {
                "status": status,
                "headers": headers,
                "payload": record.content_stream().read(),
            }
            flow.response = http.Response.make(
                parsed_record['status'],
                parsed_record['payload'],
                parsed_record['headers'],
            )
            record.raw_stream.seek(0)
        except Exception as exn:
            print(f'Failed to archive response: {exn}')

class Instrument(object):

    def __init__(self):
        self.WORKING_DIR = os.getcwd()
        print('Jalangi home is ' + JALANGI_HOME)
        print('Current working directory is ' + self.WORKING_DIR)

        self.domEvents = [
            'onabort', 'onafterprint', 'onanimationend', 'onanimationiteration', 'onanimationstart', 
            'onbeforeprint', 'onbeforeunload', 'onblur', 'oncanplay', 'oncanplaythrough', 'onchange', 
            'onclick', 'oncontextmenu', 'oncopy', 'oncut', 'ondblclick', 'ondrag', 'ondragend', 
            'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'ondurationchange', 
            'onended', 'onerror', 'onfocus', 'onfocusin', 'onfocusout', 'onfullscreenchange', 
            'onfullscreenerror', 'onhashchange', 'oninput', 'oninvalid', 'onkeydown', 'onkeypress', 
            'onkeyup', 'onload', 'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onmessage', 
            'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseover', 'onmouseout', 
            'onmouseup', 'onoffline', 'ononline', 'onopen', 'onpagehide', 'onpageshow', 'onpaste', 
            'onpause', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onresize', 'onreset', 
            'onscroll', 'onsearch', 'onseeked', 'onseeking', 'onselect', 'onshow', 'onstalled', 
            'onsubmit', 'onsuspend', 'ontimeupdate', 'ontoggle', 'ontouchcancel', 'ontouchend', 
            'ontouchmove', 'ontouchstart', 'ontransitionend', 'onunload', 'onvolumechange', 'onwaiting', 
            'onwheel'
        ]

    def load(self, loader):
        loader.add_option(
            name = 'useCache',
            typespec = bool,
            default = True,
            help = 'Use the cache',
        )
        loader.add_option(
            name = 'onlyUseCache',
            typespec = bool,
            default = False,
            help = 'Only use the instrumented cache, do not try to instrument anything dynamically',
        )
        loader.add_option(
            name = 'useBabel',
            typespec = bool,
            default = True,
            help = 'Rewrite JavaScript with Babel before instrumentation',
        )
        loader.add_option(
            name = 'ignoreURLs',
            typespec = list,
            default = [],
            help = 'For not invoking jalangi for certain URLs'
        )
        loader.add_option(
            name = 'jalangiArgs',
            typespec = str,
            default = '',
            help = 'Arguments to pass to Jalangi'
        )
        loader.add_option(
            name = 'disableInstrumentation',
            typespec = bool,
            default = False,
            help = 'Disable the concolic execution hooks'
        )
        # --- DynaJS port -------------------------------------------------
        loader.add_option(
            name = 'instrumenter',
            typespec = str,
            default = 'jalangi',
            help = 'jalangi (original) or dynajs'
        )
        loader.add_option(
            name = 'dynajsServer',
            typespec = str,
            default = 'http://127.0.0.1:8399/instrument',
            help = 'DynaJS instrument-server endpoint'
        )
        loader.add_option(
            name = 'dynajsHeader',
            typespec = str,
            default = '',
            help = 'Comma-separated scripts inlined at the top of every HTML document (DynaJS runtime, analysis)'
        )
        

    def babel_rewrite(self, infn, outfn):
        # since we will change the working directory, the in/out file path need to be absolute
        fin = os.path.abspath(infn)
        fout = os.path.abspath(outfn)
        # assuming babel is installed adjacent to this script's directory
        scriptdir = Path(__file__).parent.parent.resolve()
        cmd = ['npx', 'babel', fin, '--config-file', './babelrc']
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, cwd=scriptdir, stderr= subprocess.PIPE)
        try:
            stdout, stderr = proc.communicate()
            if proc.returncode != 0:
                print("Error during babel rewrite:", stderr)
                with open(fin, 'rb') as f:
                    stdout = f.read()
        except:
            proc.kill()
            proc.wait()
            raise
        with open(fout, "wb") as outf:
            outf.write(stdout)

    def babel_rewrite_snippet(self, snippet):
        with tempfile.TemporaryDirectory() as tmpdir:
            tempfn = os.path.join(tmpdir, 'tmpjs')
            with open(tempfn, "wb") as tempf:
                tempf.write(snippet.encode("UTF-8"))
            
            self.babel_rewrite(tempfn, tempfn)
            content = ""

            with open(tempfn, "rb") as tempf:
                content = tempf.read()
        return "\n\n"+content.decode("UTF-8")

    # --- DynaJS port -----------------------------------------------------
    def dynajs_instrument(self, code, label, kind='script'):
        """Instrument one snippet; on failure return the original code."""
        body = json.dumps({'code': code, 'label': label, 'kind': kind}).encode('utf-8')
        req = urllib.request.Request(ctx.options.dynajsServer, data=body,
                                     headers={'content-type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                return resp.read().decode('utf-8')
        except urllib.error.HTTPError as e:
            print(f'DYNAJS_INSTRUMENT_FAIL {label}: {e.read()[:300]}')
        except Exception as e:
            print(f'DYNAJS_INSTRUMENT_FAIL {label}: {e}')
        return code if kind == 'script' else None

    def dynajs_header(self):
        if not hasattr(self, '_dynajs_header'):
            parts = []
            for path in [p for p in ctx.options.dynajsHeader.split(',') if p]:
                with open(path, 'r', encoding='utf-8') as f:
                    src = f.read().replace('</script', '<\\/script')
                parts.append('<script>' + src + '</script>')
            self._dynajs_header = ''.join(parts)
        return self._dynajs_header

    def dynajs_process(self, flow, content, ext):
        url = flow.request.scheme + '://' + flow.request.host + ':' + str(flow.request.port) + flow.request.path
        text = content.decode('utf-8', errors='replace')
        if ext == 'js':
            return self.dynajs_instrument(text, url).encode('utf-8')
        soup = BeautifulSoup(text, features="html.parser")
        for tag in soup.find_all(integrity=True):
            del tag['integrity']
        n = 0
        for s in soup.find_all('script'):
            if s.has_attr('src') or s.string is None:
                continue
            if s.has_attr('type') and not (s['type'].lower().endswith('javascript') or
                                           s['type'].lower().endswith('ecmascript')):
                continue
            s.string = self.dynajs_instrument(s.string, f'{url}#inline-{n}')
            n += 1
        # every on* attribute, like Jalangi (self.domEvents misses e.g. onmousewheel);
        # a non-event on* attribute is an inert string, so instrumenting it is harmless
        for t in soup.find_all(True):
            for e in [k for k in t.attrs if k.lower().startswith('on') and isinstance(t.attrs[k], str)]:
                out = self.dynajs_instrument(t[e], f'{url}#{e}-{n}', 'handler')
                n += 1
                if out is not None:
                    t[e] = out
        return (self.dynajs_header() + str(soup)).encode('utf-8')

    def processFile(self, flow, content, ext):
        if ctx.options.instrumenter == 'dynajs':
            try:
                return self.dynajs_process(flow, content, ext)
            except Exception:
                print('Exception in dynajs_process() @ proxy.py')
                print(traceback.format_exc())
                return content
        print("Only use cache:", ctx.options.onlyUseCache)
        try:
            url = flow.request.scheme + '://' + flow.request.host + ':' + str(flow.request.port) + flow.request.path
            name = 'index'
            
            hash = hashlib.md5(content).hexdigest()
            folder = f'{CACHE_FOLDER}/{flow.request.host}/{hash}'
            fileName = f'{folder}/{name}.{ext}'
            instrumentedFileName = f'{folder}/{name}_jalangi_.{ext}'
            if not os.path.exists(folder):
                os.makedirs(folder)
            if not ctx.options.useCache or not os.path.isfile(instrumentedFileName):
                if ctx.options.onlyUseCache:
                    # Do not try to instrument anything
                    print('Skipping dynamic instrumentation due to onlyUseCache option')
                    return None

                print('Instrumenting: ' + fileName + ' from ' + url)
                with open(fileName, 'wb') as file:
                    file.write(sj.encode_input(content))
                if ctx.options.useBabel:
                    # after the file is written, we can rewrite it with babel
                    if ext == 'js':
                        # invoke babel here to transpile js code
                        self.babel_rewrite(fileName, fileName)
                    elif ext == 'html':
                        # we parse html tags and events to rewrite scripts
                        with open(fileName, "rb") as fin:
                            content = fin.read()
                        soup = BeautifulSoup(content, features="html.parser")
                        # rewrite all code in between <script></script>
                        scripts = soup.find_all('script')
                        for s in scripts:
                            if s is None:
                                continue
                            # only if it doesn't have a src file
                            # and (no type or type is javascript or type is ecmascript)
                            if not s.has_attr('src') and \
                                (not s.has_attr('type') or \
                                s['type'].lower().endswith('javascript') or \
                                s['type'].lower().endswith('ecmascript')) :
                                if s.string is not None:
                                    s.string = self.babel_rewrite_snippet(s.string)
                        # now deal with the on<event> code snippets
                        for e in self.domEvents:
                            tags = soup.find_all(attrs={e: True})
                            for t in tags:
                                rewritten = self.babel_rewrite_snippet(t[e])
                                t[e] = rewritten
                        with open(fileName, 'w') as fout:
                            fout.write(str(soup))
                sub_env = { 'JALANGI_URL': url }
                def mapper(p):
                    path = os.path.abspath(os.path.join(self.WORKING_DIR, p))
                    return path if not p.startswith('--') and (os.path.isfile(path) or os.path.isdir(path)) else p
                jalangiArgs = ' '.join([mapper(x) for x in ctx.options.jalangiArgs.split(' ') if x != ''])
                success = sj.execute(sj.INSTRUMENTATION_SCRIPT + ' ' + jalangiArgs + ' ' + fileName + ' --out ' + instrumentedFileName + ' --outDir ' + os.path.dirname(instrumentedFileName), None, sub_env)
                if not success:
                    return None # Failed to instrument, return original version of code            
            else:
                print('Already instrumented: ' + fileName + ' from ' + url)
            with open(instrumentedFileName, "rb") as file:
                data = file.read()
                if ctx.options.disableInstrumentation:
                    data = data.replace(
                        b"this.__instrumentation_enabled = true;",
                        b"this.__instrumentation_enabled = false;"
                    )
            return data
        except:
            print('Exception in processFile() @ proxy-5.2.py')
            exc_type, exc_value, exc_traceback = sys.exc_info()
            lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
            print(''.join(lines))
            return content

    def default_response(self, flow):
        # Do not invoke jalangi if the domain is ignored
        for path in ctx.options.ignoreURLs:
            if flow.request.url.startswith(path):
                return
        # Do not invoke jalangi if the requested URL contains the query parameter noInstr
        # (e.g. https://cdn.com/jalangi/jalangi.min.js?noInstr=true)
        if flow.request.query and flow.request.query.get('noInstr', None):
            return
        try:
            flow.response.decode()
            content_type = None
            csp_key = None
            for key in flow.response.headers.keys():
                if key.lower() == "content-type":
                    content_type = flow.response.headers[key].lower()
                elif key.lower() == "content-security-policy":
                    csp_key = key
            if content_type:
                tp = None
                if content_type.find('javascript') >= 0:
                    tp = 'js'
                if content_type.find('html') >= 0:
                    tp = 'html'
                
                if tp:
                    new_response = self.processFile(flow, flow.response.content, tp)
                    if new_response is not None:
                        flow.response.content = new_response
            # Disable the content security policy since it may prevent jalangi from executing
            if csp_key:
                flow.response.headers.pop(csp_key, None)
        except:
            print('Exception in response() @ proxy.py')
            exc_type, exc_value, exc_traceback = sys.exc_info()
            lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
            print(''.join(lines))
 
    @concurrent
    def response(self, flow):
        return self.default_response(flow)



class Rewrite(object):

    def __init__(self):
        self.WORKING_DIR = os.getcwd()
        print('Jalangi home is ' + JALANGI_HOME)
        print('Current working directory is ' + self.WORKING_DIR)

        self.domEvents = [
            'onabort', 'onafterprint', 'onanimationend', 'onanimationiteration', 'onanimationstart', 
            'onbeforeprint', 'onbeforeunload', 'onblur', 'oncanplay', 'oncanplaythrough', 'onchange', 
            'onclick', 'oncontextmenu', 'oncopy', 'oncut', 'ondblclick', 'ondrag', 'ondragend', 
            'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'ondurationchange', 
            'onended', 'onerror', 'onfocus', 'onfocusin', 'onfocusout', 'onfullscreenchange', 
            'onfullscreenerror', 'onhashchange', 'oninput', 'oninvalid', 'onkeydown', 'onkeypress', 
            'onkeyup', 'onload', 'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onmessage', 
            'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseover', 'onmouseout', 
            'onmouseup', 'onoffline', 'ononline', 'onopen', 'onpagehide', 'onpageshow', 'onpaste', 
            'onpause', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onresize', 'onreset', 
            'onscroll', 'onsearch', 'onseeked', 'onseeking', 'onselect', 'onshow', 'onstalled', 
            'onsubmit', 'onsuspend', 'ontimeupdate', 'ontoggle', 'ontouchcancel', 'ontouchend', 
            'ontouchmove', 'ontouchstart', 'ontransitionend', 'onunload', 'onvolumechange', 'onwaiting', 
            'onwheel'
        ]

    def babel_rewrite(self, infn, outfn):
        # since we will change the working directory, the in/out file path need to be absolute
        fin = os.path.abspath(infn)
        fout = os.path.abspath(outfn)

        # assuming babel is installed adjacent to this script's directory
        scriptdir = Path(__file__).parent.parent.resolve()
        cmd = ['npx', 'babel', fin, '--config-file', './babelrc_chromium73']
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, cwd=scriptdir, stderr= subprocess.PIPE)
        try:
            stdout, stderr = proc.communicate()
            if proc.returncode != 0:
                print("Error during babel rewrite:", stderr)
                with open(fin, 'rb') as f:
                    stdout = f.read()
        except:
            proc.kill()
            proc.wait()
            raise
        with open(fout, "wb") as outf:
            outf.write(stdout)

    def babel_rewrite_snippet(self, snippet):
        with tempfile.TemporaryDirectory() as tmpdir:
            tempfn = os.path.join(tmpdir, 'tmpjs')
            with open(tempfn, "wb") as tempf:
                tempf.write(snippet.encode("UTF-8", errors='ignore'))
            
            self.babel_rewrite(tempfn, tempfn)
            content = ""

            with open(tempfn, "rb") as tempf:
                content = tempf.read()
        return "\n\n"+content.decode("UTF-8", errors='ignore')

    def processFile(self, content, ext):
        try:
            
            with tempfile.TemporaryDirectory() as tmpdir:
                fileName = os.path.join(tmpdir, 'tmpjs')

                with open(fileName, 'wb') as file:
                    file.write(content)
                    
                # after the file is written, we can rewrite it with babel
                if ext == 'js':
                    # invoke babel here to transpile js code
                    self.babel_rewrite(fileName, fileName)
                elif ext == 'html':
                    content = b"""<script>
Object.defineProperty(HTMLScriptElement.prototype, 'integrity', {
    set: function(newValue) {
        console.log('Attempt to set integrity blocked: ', newValue);
        // Optionally, you can still allow setting by uncommenting the following line:
        // Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'integrity').set.call(this, newValue);
    }
});
</script>""" + content
                    # we parse html tags and events to rewrite scripts
                    soup = BeautifulSoup(content, features="html.parser")

                    for tag in soup.find_all(integrity=True):
                        del tag['integrity']

                    # rewrite all code in between <script></script>
                    scripts = soup.find_all('script')
                    for s in scripts:
                        if s is None:
                            continue
                        # only if it doesn't have a src file
                        # and (no type or type is javascript or type is ecmascript)
                        if not s.has_attr('src') and \
                            (not s.has_attr('type') or \
                            s['type'].lower().endswith('javascript') or \
                            s['type'].lower().endswith('ecmascript')) :
                            if s.string is not None:
                                s.string = self.babel_rewrite_snippet(s.string)
                    # now deal with the on<event> code snippets
                    for e in self.domEvents:
                        tags = soup.find_all(attrs={e: True})
                        for t in tags:
                            rewritten = self.babel_rewrite_snippet(t[e])
                            t[e] = rewritten

                    with open(fileName, 'wb') as fout:
                        fout.write(soup.encode())
            
                with open(fileName, "rb") as file:
                    data = file.read()
                return data
        except:
            print('Exception in processFile() @ proxy-5.2.py')
            exc_type, exc_value, exc_traceback = sys.exc_info()
            lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
            print(''.join(lines))
            return content

    def default_response(self, flow):
        try:
            content_type = None
            csp_key = None
            for key in flow.response.headers.keys():
                if key.lower() == "content-type":
                    content_type = flow.response.headers[key].lower()
                elif key.lower() == "content-security-policy":
                    csp_key = key
            if content_type:
                tp = None
                if content_type.find('javascript') >= 0:
                    tp = 'js'
                if content_type.find('html') >= 0:
                    tp = 'html'
                
                if tp:
                    new_response = self.processFile(flow.response.content, tp)
                    if new_response is not None:
                        flow.response.content = new_response
            # Disable the content security policy since it may prevent jalangi from executing
            if csp_key:
                flow.response.headers.pop(csp_key, None)
        except:
            print('Exception in response() @ proxy.py')
            exc_type, exc_value, exc_traceback = sys.exc_info()
            lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
            print(''.join(lines))
 
    @concurrent
    def response(self, flow):
        return self.default_response(flow)



class FreshenArchive(object):
    """
    Archive replayer that responds to browser requests with
    responses from a WARC 1.1 format archive.
        It tries to load an archive if it exists. Otherwise, it considers an empty archive
    
    """

    def __init__(self):
        self.add_timeframe = 24*60*60 # Number os seconds to add to a cookie/header if it is expired
        self.before = 30*60 # Any cookie/header that expires before now + this will be modified

    def response(self, flow):
        cookie_headers = flow.response.headers.get_all("Set-Cookie")
        new_cookie_headers = []

        for header in cookie_headers:
            cookies = SimpleCookie()
            cookies.load(header)

            for key, morsel in cookies.items():
                if 'expires' in morsel:
                    try:
                        expire_date_tuple = parsedate_tz(morsel['expires'])
                        if expire_date_tuple:
                            expire_date = datetime.fromtimestamp(mktime_tz(expire_date_tuple))
                            threshold = datetime.now() + timedelta(seconds=self.before)
                            if expire_date < threshold:
                                new_expire_date = threshold + timedelta(seconds=self.add_timeframe)
                                morsel['expires'] = new_expire_date.strftime('%a, %d-%b-%Y %H:%M:%S GMT')
                    except Exception as e:
                        print(f"Error parsing date: {e}")

            new_cookie_headers.append(cookies.output(header='', sep=',').strip())

        flow.response.headers.set_all("Set-Cookie", new_cookie_headers)


def get_args(sys_args):
    args = {}
    for arg in sys_args:
        arg = arg.strip()
        if '=' in arg:
            parts = arg.split('=')
            key = parts[0].strip('--')
            value = parts[1]
            args[key] = value
        else:
            key = arg.strip('--')
            args[key] = None
    return args

# Load the addons based on CLI flags
addons = []
args = get_args(sys.argv[1:])
print(f'Args: {args}')
if 'archive' in args and args['archive'] == 'true':
    print('Loading Archive addon')
    addons.append(Archive())
if 'replay' in args and args['replay'] == 'true':
    print('Loading Replay addon')
    addons.append(Replay())
#print('Loading Rewrite addon')
#addons.append(Rewrite())
if 'instrument' in args and args['instrument'] == 'true':
    print('Loading Instrument addon')
    addons.append(Instrument())
if 'append' in args and args['append'] == 'true':
    print('Loading Append addon')
    addons.append(Append())
if 'freshenarchive' in args and args['freshenarchive'] == 'true':
    print('Loading FreshenArchive addon')
    addons.append(FreshenArchive())
