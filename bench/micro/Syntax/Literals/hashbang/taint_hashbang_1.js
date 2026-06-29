#!/usr/bin/env node
// @type taint
// @target es6+ hashbang
// @feature syntax hashbang

function __test_taint__(tainted) {
    var thb_r = tainted + "!";
    // @witness __test_taint__('x') => 'x' + '!' = 'x!' tainted
    __assert_taint__(thb_r, true);
}

__test_taint__(__set_taint__("tv"));
