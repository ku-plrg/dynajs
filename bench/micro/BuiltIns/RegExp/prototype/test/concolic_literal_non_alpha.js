// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-escape

function __test_symbolic__(symbolic) {
  if (/^void helloWorld\(\) \{\{\}\} DOGDOGDOG console.log\(HELLO WORLD\) HOW ARE YOU$/.test(symbolic)) {
    // @witness __test_symbolic__("void helloWorld() {{}} DOGDOGDOG consoleXlog(HELLO WORLD) HOW ARE YOU")
    __IS_SAT__(symbolic !== "void helloWorld() {{}} DOGDOGDOG console.log(HELLO WORLD) HOW ARE YOU", true);
  }
}

__test_symbolic__(__symbolic__("s", "void helloWorld() {{}} DOGDOGDOG console log(HELLO WORLD) HOW ARE YOU"));
