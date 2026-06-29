// @type concolic
// @target es6+ RegExp.prototype.exec
// @feature builtin regexp-exec-global-lastindex

function __test_symbolic__(symbolic) {
  var re = /abc/g;
  if (symbolic.length < 4) {
    if (re.exec(symbolic)) {
      // @witness the only length<4 string matching /abc/g is "abc"; the first exec leaves lastIndex at 3, so the second exec finds no further "abc" and is always null
      __IS_SAT__(re.exec(symbolic) !== null, false);
    }
  }
}

__test_symbolic__(__symbolic__("s", "abc"));
