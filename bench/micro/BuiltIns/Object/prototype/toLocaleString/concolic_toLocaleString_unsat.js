// @type concolic
// @target es5 Object.prototype.toLocaleString
// @feature builtin tolocalestring

function __test_symbolic__(symbolic) {
  var s = ({}).toLocaleString();
  if (symbolic.length >= 0) {
    // @witness a plain object's toLocaleString defaults to toString, always "[object Object]"
    __IS_SAT__(s !== "[object Object]", false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', "x"));
