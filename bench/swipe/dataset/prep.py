"""Build per-page replay inputs from the SWIPE dataset (João's WARCs).

Run inside the swipe image (needs warcio + tldextract, as proxy.py does):

    python3 prep.py <swipe-dataset-dir> <out-dir>

For every NNN/ that has a *.warc.gz, writes
    <out-dir>/NNN/output/<hash>.warc.gz        (copy of the archive)
    <out-dir>/NNN/output/archive_store.json    ({eTLD: {path: <container path>}})
    <out-dir>/NNN/target.txt                   (the crawl's start URL)
and <out-dir>/manifest.json. The start URL comes from the SWIPE start record
`http://240.240.240.240/?target=<url>&type=...` inside the archive.
"""
import json
import shutil
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import tldextract
from warcio.archiveiterator import ArchiveIterator

CONTAINER_OUT = '/home/scan/jalangi2-workspace/scripts/swipe/output'


def start_url(warc: Path):
    with open(warc, 'rb') as f:
        for rec in ArchiveIterator(f):
            uri = rec.rec_headers.get_header('WARC-Target-URI') or ''
            if '240.240.240.240' in uri and 'target=' in uri:
                q = parse_qs(urlparse(uri).query)
                if 'target' in q:
                    return q['target'][0]
    return None


def store_key(url: str):
    """(eTLD, path) exactly as proxy.py's URL.eTLD()/path() compute them."""
    u = urlparse(url)
    ext = tldextract.extract(u.hostname or '')
    etld = '.'.join(p for p in (ext.subdomain, ext.domain, ext.suffix) if p)
    return etld, u.path or '/'


def main(src: Path, out: Path):
    manifest = []
    for d in sorted(p for p in src.iterdir() if p.is_dir()):
        warcs = sorted(d.glob('*.warc.gz'))
        if not warcs:
            continue
        warc = warcs[0]
        url = start_url(warc)
        if url is None:
            manifest.append({'id': d.name, 'error': 'no start record'})
            continue
        etld, path = store_key(url)
        od = out / d.name / 'output'
        od.mkdir(parents=True, exist_ok=True)
        shutil.copy2(warc, od / warc.name)
        (od / 'archive_store.json').write_text(
            json.dumps({etld: {path: f'{CONTAINER_OUT}/{warc.name}'}}))
        (out / d.name / 'target.txt').write_text(url + '\n')
        manifest.append({'id': d.name, 'target': url, 'warc': warc.name,
                         'eTLD': etld, 'path': path})
    (out / 'manifest.json').write_text(json.dumps(manifest, indent=1))
    ok = [m for m in manifest if 'target' in m]
    print(f'{len(ok)} pages prepared, {len(manifest) - len(ok)} skipped')


if __name__ == '__main__':
    main(Path(sys.argv[1]), Path(sys.argv[2]))
