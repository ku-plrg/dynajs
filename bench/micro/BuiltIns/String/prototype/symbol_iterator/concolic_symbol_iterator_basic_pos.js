// @type concolic
// @target es6+ String.prototype.symbol_iterator
// @feature builtin symbol_iterator
// @done


function __test_symbolic__(symbolic) {


  if([...symbolic][0] === 'a' && typeof symbolic === 'string') {

    // @witness first char is 'a'
    __IS_SAT__(symbolic[0] !== 'a', true);
  }


}

__test_symbolic__(__symbolic__('s', "abc"));
