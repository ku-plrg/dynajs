const basename = (p, ext) => { let b = String(p).split('/').pop(); return ext && b.endsWith(ext) ? b.slice(0, -ext.length) : b; };
const dirname = (p) => String(p).split('/').slice(0, -1).join('/') || '.';
const extname = (p) => { const b = basename(p); const i = b.lastIndexOf('.'); return i > 0 ? b.slice(i) : ''; };
const join = (...a) => a.filter(Boolean).join('/').replace(/\/+/g, '/');
const resolve = join, relative = (a, b) => b, sep = '/';
export default { basename, dirname, extname, join, resolve, relative, sep };
export { basename, dirname, extname, join, resolve, relative, sep };
