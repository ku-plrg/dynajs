// @type taint
// @target es6+ async-await
// @feature syntax async-await
// @done

function __test_taint__(tainted) {
    (async function () {
      var clean = await "clean";
      // @witness await of a clean literal, clean
      __assert_taint__(clean, false);
    })();
}

__test_taint__(__set_taint__("tv"));
