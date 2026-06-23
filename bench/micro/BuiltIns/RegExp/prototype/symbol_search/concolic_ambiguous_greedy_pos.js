// @type concolic
// @target es5 String.prototype.search
// @feature builtin regexp-search-greedy-pos

function __test_symbolic__(symbolic) {
  if (symbolic.length < 7) {
    var nl = symbolic.search(/(a*)/);
    if (nl !== -1) {
      if (symbolic === "aaaa_a") {
        // @witness guard pins the string to "aaaa_a"; (a*) matches greedily at index 0, so search returns 0, never 5
        __IS_SAT__(nl === 5, false);
      }
    }
  }
}

__test_symbolic__(__symbolic__('s', "aaaa_a"));
