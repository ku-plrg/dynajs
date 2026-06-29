// @type taint
// @target es6+ class
// @feature syntax class
// @done

class TCL_C {
  constructor(v) {
    this.v = v;
  }
  get() {
    return this.v;
  }
}

class TCL_D extends TCL_C {
  constructor(v) {
    super(v);
  }
  via() {
    return super.get();
  }
}

function __test_taint__(tainted) {
    var tcl_d = new TCL_D(tainted);
    // @witness __test_taint__("x")
    __assert_taint__(tcl_d.get(), true);
}

__test_taint__(__set_taint__("tv"));
