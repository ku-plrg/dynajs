// @type taint
// @target es5 String.prototype.substring
// @feature builtin substring
// @done

function __test_taint__(tainted) {
    var x0 = 'f';
    var x2 = 'o';
    var x3 = 'b';
    var x4 = 'a';
    var x = x0 + tainted + x2 + x3 + x4;

    // @witness always x.substring(2,2)=''
    __assert_taint__(x.substring(2, 2), false);
}

__test_taint__(__set_taint__('q'));
