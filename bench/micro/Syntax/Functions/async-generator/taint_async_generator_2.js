// @type taint
// @target es6+ async-generator
// @feature syntax async-generator
// @done

function __test_taint__(tainted) {
    async function* tagn_gen() {
      yield "clean";
      yield tainted;
    }
    (async function () {
      var tagn_vals = [];
      for await (var v of tagn_gen()) {
        tagn_vals.push(v);
      }
      // @witness __test_taint__('x') => second yield = 'x' tainted
      __assert_taint__(tagn_vals[1], true);
    })();
}

__test_taint__(__set_taint__("tv"));
