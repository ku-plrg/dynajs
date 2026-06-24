// @type concolic
// @target es6+ RegExp
// @feature syntax regexp-unicode-codepoint
// @done

function __test_symbolic__(symbolic) {
    if (/^\u{4444}$/u.test(symbolic)) {
      // @witness the /^\u{4444}$/u.test(symbolic) guard forces symbolic === String.fromCharCode(0x4444)
      __IS_SAT__(symbolic !== String.fromCharCode(0x4444), false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', String.fromCharCode(0x4444)));
