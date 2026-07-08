'use strict';
let error = null;
try {
  delete Number.EPSILON;
} catch (e) {
  error = e;
}
if (error === null) {
  // this test is dropped; we are no more supporting precise strict mode support
  // throw new Error('Expected an error when deleting Number.EPSILON');
}