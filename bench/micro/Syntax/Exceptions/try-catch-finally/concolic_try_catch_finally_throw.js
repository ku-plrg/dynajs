// @type concolic
// @target es5 try-catch-finally
// @feature syntax try-catch-finally

function __test_symbolic__(symbolic) {
    var tc_r = 0;
    try {
      if (symbolic < 0) {
        throw "neg";
      }
      tc_r = 1;
    } catch (e) {
      tc_r = -1;
    }
    if (symbolic < 0) {
      // @witness the symbolic < 0 guard forces tc_r === -1
      __IS_SAT__(tc_r !== -1, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', -1));
