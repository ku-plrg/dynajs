// @type taint
// @target es6+ String.prototype.charCodeAt
// @feature builtin charCodeAt
// @done

function __test_taint__(tainted) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + tainted + x2;

    // @witness always x.charCodeAt(0)=104 ('h', clean prefix)
    __assert_taint__(x.charCodeAt(0), false);
}

__test_taint__(__set_taint__('hello'));
