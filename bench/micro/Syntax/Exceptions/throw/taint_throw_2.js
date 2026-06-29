// @type taint
// @target es5 throw
// @feature syntax throw

function __test_taint__(tainted) {
    var tt_t;
    try {
      throw tainted;
    } catch (e) {
      tt_t = e;
    }

    var tt_c;
    try {
      throw "clean";
    } catch (e) {
      tt_c = e;
    }
    // @witness throws a clean literal => caught value clean
    __assert_taint__(tt_c, false);
}

__test_taint__(__set_taint__("tv"));
