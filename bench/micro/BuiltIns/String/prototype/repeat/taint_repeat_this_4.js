// @type taint
// @target es6+ String.prototype.repeat
// @feature builtin repeat
// @done

function __test_taint__(tainted) {
    var x0 = 'b';
    var x = tainted + x0;
    var r = x.repeat(2);

    // @witness always x.repeat(0)='' empty
    __assert_taint__(x.repeat(0), false);
}

__test_taint__(__set_taint__('a'));
