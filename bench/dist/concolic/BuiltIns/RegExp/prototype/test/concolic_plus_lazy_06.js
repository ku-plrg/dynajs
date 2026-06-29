// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^he+?l+?l+?o_wor+?l+?d+?$/.test(symbolic)) {
    // @witness "hellooooo_world" has no "_wor" segment (extra o's break o_wor), so it never matches this regex
    __IS_SAT__(symbolic === "hellooooo_world", false);
  }

  if (/^z+?$/.test(symbolic)) {
    if (symbolic.length < 5) {
      for (var i = 0; i < symbolic.length; i++) {
      }
    }
  }
}

__test_symbolic__(__symbolic__("s", "helllllo_world"));
