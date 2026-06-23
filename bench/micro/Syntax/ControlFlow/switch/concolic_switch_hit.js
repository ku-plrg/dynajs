// @type concolic
// @target es5 switch
// @feature syntax switch

function __test_symbolic__(symbolic) {
    switch (symbolic) {
      case 1:
        __IS_SAT__(true, false);
        break;
      case 2:
        // @witness symbolic === 2 always holds
        __IS_SAT__(symbolic !== 2, false);
        break;
      default:
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 2));
