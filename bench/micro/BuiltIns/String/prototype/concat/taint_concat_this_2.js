// @type taint
// @target es5 String.prototype.concat
// @feature builtin concat
// @done

function __test_taint__(tainted) {
    var x = tainted + 'wo';
    var r = x.concat('rld');

    // @witness always d[r.length-1]='d' (clean suffix of 'bar')
    __assert_taint__(r[r.length - 1], false);
}

__test_taint__(__set_taint__('hello'));
