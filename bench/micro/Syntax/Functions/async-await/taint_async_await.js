// @type taint
// @target es6+ async-await
// @feature syntax async-await
// @done

function __test_taint__(tainted) {
    (async function () {
      var r = await tainted;
      __assert_taint__(r, true);
      var clean = await "clean";
      __assert_taint__(clean, false);
    })();
}

__test_taint__(__set_taint__("tv"));
