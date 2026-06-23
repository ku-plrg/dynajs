// @type taint
// @target es5 Object.prototype.hasOwnProperty
// @feature builtin hasOwnProperty

function __test_taint__(tainted) {
    var o = {p: tainted};
    // @witness boolean result, clean
    __assert_taint__(o.hasOwnProperty('p'), false);
    // @witness boolean result, clean
    __assert_taint__(o.hasOwnProperty('absent'), false);
}

__test_taint__(__set_taint__('hello'));
