// @type taint
// @target es5 labeled-statement
// @feature syntax labeled-statement
// @done

function __test_taint__(tainted) {
    var tlb_kept = "clean";
    loop: for (var k = 0; k < 2; k++) {
      continue loop;
      tlb_kept = tainted;
    }
    // @witness always "clean"
    __assert_taint__(tlb_kept, false);
}

__test_taint__(__set_taint__("tv"));
