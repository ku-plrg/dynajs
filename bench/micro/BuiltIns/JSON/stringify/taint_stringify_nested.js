// @type taint
// @target es5 JSON.stringify
// @feature builtin stringify
// @done

function __test_taint__(tainted) {
    // JSON.stringify({k:'ab'}) => '{"k":"ab"}' (10 chars)
    var r = JSON.stringify({ k: tainted });

    // @witness always r[0]='{' — structural brace
    __assert_taint__(r[0], false);

    // @witness always r[1]='"' — structural key quote
    __assert_taint__(r[1], false);

    // @witness always r[2]='k' — clean key char
    __assert_taint__(r[2], false);

    // @witness always r[4]=':' — structural colon
    __assert_taint__(r[4], false);

    // @witness always r[5]='"' — structural value open quote
    __assert_taint__(r[5], false);

    // @witness __test_taint__('x') => r[6]='x' — content char from tainted value
    __assert_taint__(r[6], true);

    // @witness always r[r.length - 2]='"' — structural value close quote
    __assert_taint__(r[r.length - 2], false);

    // @witness always r[r.length - 1]='}' — structural brace
    __assert_taint__(r[r.length - 1], false);
}

__test_taint__(__set_taint__('ab'));
