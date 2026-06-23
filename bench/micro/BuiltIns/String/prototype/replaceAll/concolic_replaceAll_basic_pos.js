// @type concolic
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll
// @done


function __test_symbolic__(symbolic) {

  var r = symbolic.replaceAll('z', 'Y');
  if (r === symbolic) {
    // @witness replaceAll('z','Y') identity means no 'z' present anywhere
    __IS_SAT__(symbolic[0] === 'z', false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "aac"));
