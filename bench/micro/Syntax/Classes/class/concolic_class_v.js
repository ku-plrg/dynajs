// @type concolic
// @target es6+ class
// @feature syntax class

class CL_Box {
  constructor(n) {
    this.n = n;
  }
  dbl() {
    return this.n + this.n;
  }
}

function __test_symbolic__(symbolic) {
    var cl_box = new CL_Box(symbolic);
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces cl_box.dbl() === 10
      __IS_SAT__(cl_box.dbl() !== 10, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
