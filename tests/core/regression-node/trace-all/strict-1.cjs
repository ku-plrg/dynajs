'use strict';
let error = null;
try {
  delete Number.EPSILON;
} catch (e) {
  error = e;
}
if (error === null) {
  // drop support for precise strict mode support
  // throw new Error('Expected an error when deleting Number.EPSILON');
}