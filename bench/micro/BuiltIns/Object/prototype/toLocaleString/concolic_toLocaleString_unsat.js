// @type concolic
// @target es5 Object.prototype.toLocaleString
// @feature builtin tolocalestring

function __test_symbolic__(symbolic) {
  if (({}).toLocaleString().length === symbolic) {
    // @witness a plain object's toLocaleString is "[object Object]" (length 15), so matching its length pins symbolic to 15
    __IS_SAT__(symbolic !== 15, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 15));
