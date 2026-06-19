// @type taint
// @target es5 String.prototype.localeCompare
// @feature builtin localeCompare
// done

function test(t) {
    var x = 'banana';

    // @witness tainted t is only the comparand; localeCompare returns -1/0/1
    __assert_taint__(x.localeCompare(t), false);
}

var t = 'apple';
__set_taint__(t);
test(t);
