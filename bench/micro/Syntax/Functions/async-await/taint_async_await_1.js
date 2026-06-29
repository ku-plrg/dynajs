// @type taint
// @target es6+ async-await
// @feature syntax async-await
// @done

function __test_taint__(tainted) {
    (async function () {
      var r = await tainted;
      // @witness __test_taint__('x') => await tainted = 'x' tainted
      __assert_taint__(r, true);
    })();
}

__test_taint__(__set_taint__("tv"));
