// @type taint
// @target es5 String.prototype.toLocaleUpperCase
// @feature builtin toLocaleUpperCase

function test(loc) {
    var x = 'abc';

    // @witness 'abc' clean; tainted loc is only the locale selector
    __assert_taint__(x.toLocaleUpperCase(loc)[0], false);

    // @witness 'abc' clean; tainted loc is only the locale selector
    __assert_taint__(x.toLocaleUpperCase(loc)[1], false);

    // @witness 'abc' clean; tainted loc is only the locale selector
    __assert_taint__(x.toLocaleUpperCase(loc)[2], false);
}

var loc = 'tr';
__set_taint__(loc);

test(loc);
