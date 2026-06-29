// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(.)(\1b)+$/.test(symbolic)) {
    // @witness group (.) captures the anchored first char and \1 re-emits it as char 1, so symbol[0] and symbol[1] are always the same char
    __IS_SAT__(symbolic[0] !== symbolic[1], false);
  }
}

__test_symbolic__(__symbolic__("s", "aab"));
