// @type concolic
// @target es6+ RegExp
// @feature syntax regexp-unicode-codepoint

function __test_symbolic__(symbolic) {
    if (/^\u{EFAF}$/u.test(symbolic)) {
      // @witness the /^\u{EFAF}$/u.test(symbolic) guard forces symbolic === String.fromCharCode(0xEFAF)
      __IS_SAT__(symbolic !== String.fromCharCode(0xEFAF), false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', String.fromCharCode(0xEFAF)));
