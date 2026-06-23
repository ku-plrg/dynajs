// @type concolic
// @target es6+ String.prototype.padStart
// @feature builtin padStart
// @done


function __test_symbolic__(symbolic) {

  var r = symbolic.padStart(4, '.');
  if (symbolic.length === 4) {
    // @witness length===4 meets target, so padStart returns source unchanged
    __IS_SAT__(r !== symbolic, false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abcd"));
