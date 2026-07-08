'use strict';

function cmp(op) {
  switch (op) {
    case '>=':
      return 'matched >=';
    default:
      throw new TypeError(`Invalid operator: ${op}`);
  }
}

module.exports = cmp;
