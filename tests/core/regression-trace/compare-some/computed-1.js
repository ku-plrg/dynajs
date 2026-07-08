let C = class {
  [1 + 1] = 2;

  static [1 + 1] = 2;
};

let c = new C();

c[1 + 1]; // 2