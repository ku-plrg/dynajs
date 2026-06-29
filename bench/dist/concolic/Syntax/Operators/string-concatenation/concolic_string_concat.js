// @type concolic
// @target es5 string-concatenation
// @feature syntax string-concatenation

function __test_symbolic__(symbolic) {
    var csc_q = symbolic + "DOGS";
    if (csc_q.length == 6) {
      // @witness the csc_q.length == 6 guard forces symbolic.length === 2
      __IS_SAT__(symbolic.length !== 2, false);
    } else {
      // @witness the csc_q.length == 6 guard forces csc_q.length != 6
      __IS_SAT__(csc_q.length == 6, false);
    }
}

__test_symbolic__(__symbolic__('s', "hello"));
