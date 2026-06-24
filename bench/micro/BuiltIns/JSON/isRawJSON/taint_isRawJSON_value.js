// @type taint
// @target es6+ JSON.isRawJSON
// @feature builtin isRawJSON

function __test_taint__(tainted) {
    var raw = JSON.rawJSON(tainted);
    // @witness boolean result, clean
    __assert_taint__(JSON.isRawJSON(raw), false);
    // @witness boolean result, clean
    __assert_taint__(JSON.isRawJSON(tainted), false);
}

__test_taint__(__set_taint__("42"));
