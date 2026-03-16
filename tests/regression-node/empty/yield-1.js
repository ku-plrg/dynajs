class A {
  x = 1;
  y = 2;

  *[ Symbol.iterator ]() {
		yield this.x;
		yield this.y;
	}
}