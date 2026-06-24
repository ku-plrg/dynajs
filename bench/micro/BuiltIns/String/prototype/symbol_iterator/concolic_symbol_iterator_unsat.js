// @type concolic
// @target es6+ String.prototype.symbol_iterator
// @feature builtin symbol_iterator
// @done


function __test_symbolic__(symbolic) {


  if([...symbolic][0] === 'a' && typeof symbolic === 'string') {

    // @witness under the guard the first char is 'a', so symbolic[0] !== 'a' can never hold
    __IS_SAT__(symbolic[0] !== 'a', false);
  }


}

__test_symbolic__(__symbolic__('s', "abc"));
