// @type concolic
// @target es6+ String.prototype.padEnd
// @feature builtin padEnd
// @done

function __test_symbolic__(symbolic) {

  var r = symbolic.padEnd(4, '.');
  if (symbolic.length === 4) {
    // @witness the length===4 guard makes padEnd return the source unchanged
    __IS_SAT__(r !== symbolic, false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abcd"));
