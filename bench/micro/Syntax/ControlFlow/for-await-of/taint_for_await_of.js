// @type taint
// @target es6+ for-await-of
// @feature syntax for-await-of

function __test_taint__(tainted) {
    (async function () {
      var arr = [Promise.resolve(tainted), Promise.resolve("clean")];
      var first;
      for await (var v of arr) {
        first = v;
        break;
      }
      __assert_taint__(first, true);
    })();
}

__test_taint__(__set_taint__("tv"));
