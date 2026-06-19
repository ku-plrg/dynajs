// @type taint
// @target es5 String.prototype.localeCompare
// @feature builtin localeCompare
// done

function test(x1) {
    var x0 = 'ban';
    var x2 = 'na';
    var x = x0 + x1 + x2;

    // @witness localeCompare returns -1/0/1, never content
    __assert_taint__(x.localeCompare('apple'), false);

    // @witness localeCompare returns -1/0/1, never content
    __assert_taint__(x.localeCompare('banana'), false);

    // @witness localeCompare returns -1/0/1, never content
    __assert_taint__(x.localeCompare('cherry'), false);
}

var x1 = 'a';
__set_taint__(x1);
test(x1);
