let error = null;
try {
  delete Number.EPSILON;
} catch (e) {
  error = e;
}
if (error !== null) {
  throw new Error('Expected no error when deleting Number.EPSILON in non-strict mode');
}