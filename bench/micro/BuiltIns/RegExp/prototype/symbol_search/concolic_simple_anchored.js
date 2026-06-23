// @type concolic
// @target es5 String.prototype.search
// @feature builtin regexp-search-anchored

function __test_symbolic__(symbolic) {
  var nl = symbolic.search(/^abc$/);
  if (nl !== -1) {
    // @witness /^abc$/ anchors the match to the string start, so a successful search always returns index 0
    __IS_SAT__(nl !== 0, false);
  }
}

__test_symbolic__(__symbolic__("s", "abc"));
