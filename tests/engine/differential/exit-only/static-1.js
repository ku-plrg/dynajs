
var thrown = new Error("thrown");
var caught;
var sameBlock = false;
var subsequentField = false;
var subsequentBlock = false;

try {
  class C {
    static {
      throw thrown;
      sameBlock = true;
    }
    static x = subsequentField = true;
    static {
      subsequentBlock = true;
    }
  }
} catch (error) {
  caught = error;
}

assert(caught === thrown, 'error should be thrown');
assert(sameBlock === false, 'same block');
assert(subsequentField === false, 'subsequent field');
assert(subsequentBlock === false, 'subsequent block');
