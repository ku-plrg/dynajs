// @type taint
// @target es5 labeled-statement
// @feature syntax labeled-statement

function __test_taint__(tainted) {
    var tlb_picked;
    outer: for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        tlb_picked = tainted;
        break outer;
      }
    }
    __assert_taint__(tlb_picked, true);
}

__test_taint__(__set_taint__("tv"));
