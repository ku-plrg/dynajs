// @type concolic
// @target es5 Object.prototype.toString
// @feature builtin tostring

function __test_symbolic__(symbolic) {
  var s = ({}).toString();
  if (symbolic.length >= 0) {
    // @witness a plain object's toString is always the tag "[object Object]"
    __IS_SAT__(s !== "[object Object]", false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', "x"));
