// @type concolic
// @target es6+ String.prototype.matchAll
// @feature builtin matchAll
// @done


function __test_symbolic__(symbolic) {

  if([...symbolic.matchAll(/a/g)].length == 0){

    // @witness symbolic does not include a
    __symbolic_assert__(symbolic[0] !== 'a', true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
