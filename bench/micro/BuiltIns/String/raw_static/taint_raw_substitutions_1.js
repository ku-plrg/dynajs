// @type taint
// @target es6+ String.raw
// @feature builtin raw-static
// @done

function __test_taint__(tainted) {
    var r = String.raw`ab${tainted}cd`;

    // @witness always r[0]='a' from literal template
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__('hello'));
