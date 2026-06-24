// @type taint
// @target es6+ JSON.rawJSON
// @feature builtin rawJSON

function __test_taint__(tainted) {
    // tainted is valid JSON text ("42"); rawJSON copies it verbatim into output
    var r = JSON.stringify({ k: JSON.rawJSON(tainted) });   // '{"k":42}'
    // @witness r[0] = '{' structural brace, clean
    __assert_taint__(r[0], false);
    // @witness __test_taint__("42") => r[5] = '4' tainted (raw text copied verbatim)
    __assert_taint__(r[5], true);
}

__test_taint__(__set_taint__("42"));
