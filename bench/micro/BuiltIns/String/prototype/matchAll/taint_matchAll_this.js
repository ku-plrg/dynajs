// @type taint
// @target es6+ String.prototype.matchAll
// @feature builtin matchAll
// @done

function __test_taint__(tainted) {
    var d1 = 'world';
    var x = tainted + d1;
    var re = /[a-z]/g;

    var arr = [...x.matchAll(re)];

    // @witness __test_taint__('x') => arr[0][0]='x' from tainted (first match)
    __assert_taint__(arr[0][0], true);

    // @witness always arr[arr.length-1][0]='d' from clean d1 (last match)
    __assert_taint__(arr[arr.length - 1][0], false);
}

__test_taint__(__set_taint__('hello'));
