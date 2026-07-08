'use strict';

/* dynajs concolic bridge for ExpoSE's `S$` module */

var S$ = {};

function NotAnErrorException() {}
S$.NotAnErrorException = NotAnErrorException;
globalThis.__NotAnError__ = NotAnErrorException;

S$.symbol = function (name, concrete) {
  if (typeof concrete !== 'undefined') {
    return globalThis.__s_symbol__(name, concrete);
  }
  return S$.pureSymbol(name);
};

S$.pureSymbol = function (name) {
  return globalThis.__s_pure__(name);
};

S$.assume = function (val) {
  if (!val) {
    throw new NotAnErrorException();
  }
};

S$.fail = function (reason) {
  throw reason;
};

S$.assert = function (value, desc) {
  if (!value) {
    if (desc instanceof Function) {
      desc = desc();
    }
    S$.fail(desc);
  }
};

module.exports = S$;
