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
      // @witness first yield is literal "clean" => clean
      __assert_taint__(tagn_vals[0], false);
    })();
}

__test_taint__(__set_taint__("tv"));
