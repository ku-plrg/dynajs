// @type taint
// @target es6+ generators
// @feature syntax generators
// @done

function __test_taint__(tainted) {
    function* tgn_gen() {
      yield "clean";
      yield tainted;
    }
    var tgn_it = tgn_gen();
    // @witness first yield is literal "clean" => clean
    __assert_taint__(tgn_it.next().value, false);
}

__test_taint__(__set_taint__("tv"));
