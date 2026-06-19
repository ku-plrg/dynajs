// @type taint
// @target es5 String.prototype.toLocaleLowerCase
// @feature builtin toLocaleLowerCase

function test(loc) {
    var x = 'ABC';

    // @witness 'ABC' clean; tainted loc is only the locale selector
    __assert_taint__(x.toLocaleLowerCase(loc)[0], false);

    // @witness 'ABC' clean; tainted loc is only the locale selector
    __assert_taint__(x.toLocaleLowerCase(loc)[1], false);

    // @witness 'ABC' clean; tainted loc is only the locale selector
    __assert_taint__(x.toLocaleLowerCase(loc)[2], false);
}

var loc = 'tr';
__set_taint__(loc);

test(loc);
