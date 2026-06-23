// @type concolic
// @target es5 try-catch-finally
// @feature syntax try-catch-finally

function __test_symbolic__(symbolic) {
    var tc_flag = 0;
    try {
      if (symbolic === 5) {
        throw "x";
      }
    } catch (e2) {
    } finally {
      tc_flag = 1;
    }
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces tc_flag === 1
      __IS_SAT__(tc_flag !== 1, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
