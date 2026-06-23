// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-global-count

function __test_symbolic__(symbolic) {
  if (symbolic.length <= 20) {
    var res = symbolic.match(/Testi/g);
    // @witness __test_symbolic__("HotDog")
    __IS_SAT__(symbolic === "HotDog", true);
    if (res) {
      // @witness __test_symbolic__("TestiTestiTestiTesti")
      __IS_SAT__(res.length > 3, true);
    }
  }
}

__test_symbolic__(__symbolic__("s", ""));
