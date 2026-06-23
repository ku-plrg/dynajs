// @type concolic
// @target es5 String.prototype.search
// @feature builtin regexp-search-charclass

function __test_symbolic__(symbolic) {
  if (symbolic.length <= 5) {
    var nl = symbolic.search(/[a-z]*/);
    if (symbolic === "hello") {
      // @witness search(/[a-z]*/) matches the empty prefix at index 0, so nl is pinned to 0 and can never be 2
      __IS_SAT__(nl === 2, false);
    }
    if (symbolic === "what") {
      // @witness /[a-z]*/ matches the empty string at index 0, so nl is always 0 and never differs from 0
      __IS_SAT__(nl !== 0, false);
    }
    // @witness /[a-z]*/ always matches at index 0, so for "12345" nl is 0 and nl !== 0 cannot hold
    __IS_SAT__(symbolic === "12345" && nl !== 0, false);
  }
}

__test_symbolic__(__symbolic__("s", ""));
