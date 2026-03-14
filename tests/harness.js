globalThis.assert = function assert(bool = true, msg = '') {
  if (!bool) {
    throw Error(`Assertion Failed: ${msg}`)
  }
};

globalThis.print = function print(...args) {
  console.log(...args);
};
