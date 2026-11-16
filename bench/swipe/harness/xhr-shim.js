// Loaded before the PSE analysis (which captures XMLHttpRequest at load time):
// requests to SWIPE's constraint server (localhost:8307) are recorded in
// window.__pse instead of being sent; everything else uses the real XHR.
(function () {
  const Real = window.XMLHttpRequest;
  window.__pse = [];
  window.__errors = [];
  window.addEventListener('error', (e) => window.__errors.push(String(e.message)));
  function Shim() {
    this._real = null;
    this._url = '';
    this.readyState = 0;
    this.responseText = '';
  }
  Shim.prototype.open = function (method, url, ...rest) {
    this._url = String(url);
    if (!/localhost:8307/.test(this._url)) {
      this._real = new Real();
      this._real.onreadystatechange = () => {
        this.readyState = this._real.readyState;
        this.responseText = this._real.responseText;
        this.onreadystatechange && this.onreadystatechange();
      };
      this._real.open(method, url, ...rest);
    }
  };
  Shim.prototype.setRequestHeader = function (k, v) {
    if (this._real) this._real.setRequestHeader(k, v);
  };
  Shim.prototype.send = function (body) {
    if (this._real) return this._real.send(body);
    try {
      window.__pse.push(JSON.parse(body));
    } catch (e) {
      window.__pse.push({ unparsable: String(body) });
    }
  };
  // pass-through requests (e.g. synchronous ones to the regex translator)
  // read their result straight from the real XHR
  Object.defineProperty(Shim.prototype, 'status', {
    get() { return this._real ? this._real.status : 200; },
  });
  Object.defineProperty(Shim.prototype, 'responseText', {
    get() { return this._real ? this._real.responseText : ''; },
    set(_v) {},
  });
  window.XMLHttpRequest = Shim;
})();
