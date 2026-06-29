// @type concolic
// @target es6+ class
// @feature syntax class

class CL_Base {
  constructor(n) {
    this.n = n;
  }
  get() {
    return this.n;
  }
}

class CL_Derived extends CL_Base {
  constructor(n) {
    super(n);
  }
  viaSuper() {
    return super.get();
  }
}

function __test_symbolic__(symbolic) {
    var cl_d = new CL_Derived(symbolic);
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces cl_d.viaSuper() === 5
      __IS_SAT__(cl_d.viaSuper() !== 5, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
