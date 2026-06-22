// @type taint
// @target es6+ String.prototype.matchAll
// @feature builtin matchAll
// @done

function __test_taint__(tainted) {
    var x = 'a1b2c3';
    var re = new RegExp(tainted, 'g');

    var arr = [...x.matchAll(re)];

    // @witness 'a1b2c3' clean; tainted is only the regexp (pattern not in result)
    __assert_taint__(arr[0][0], false);

    // @witness 'a1b2c3' clean; tainted is only the regexp (pattern not in result)
    __assert_taint__(arr[1][0], false);
}

__test_taint__(__set_taint__('\\d'));
