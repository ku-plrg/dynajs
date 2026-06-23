// @type concolic
// @target es6+ String.prototype.matchAll
// @feature builtin matchAll
// @done


function __test_symbolic__(symbolic) {

  if([...symbolic.matchAll(/a/g)].length == 0){

    // @witness empty matchAll(/a/g) guard means no 'a' anywhere, so index 0 can't be 'a'
    __IS_SAT__(symbolic[0] === 'a', false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
