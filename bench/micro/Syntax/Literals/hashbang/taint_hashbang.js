#!/usr/bin/env node
// @type taint
// @target es6+ hashbang
// @feature syntax hashbang

function __test_taint__(tainted) {
    var thb_r = tainted + "!";
    __assert_taint__(thb_r, true);
    __assert_taint__("plain", false);
}

__test_taint__(__set_taint__("tv"));
