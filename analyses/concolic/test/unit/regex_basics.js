// Concolic regex model: test / exec (captures) / search.
// __symbolic_assert__(cond, expected): expected = the ground-truth verdict
// (true => the engine should prove `cond` valid under the path condition).

// test: an exact anchored match pins the value (valid => detected)
{
  const x = __symbolic__("xa", "abc");
  if (/^abc$/.test(x)) {
    __symbolic_assert__(x === "abc", true);
  }
}

// test: contains-'a' does NOT pin the value (invalid => clean)
{
  const x = __symbolic__("xb", "abc");
  if (/a/.test(x)) {
    __symbolic_assert__(x === "abc", false);
  }
}

// exec captures: anchored single-char groups force m[0] === "ab"
{
  const x = __symbolic__("xc", "ab");
  const m = /^(a)(b)$/.exec(x);
  if (m) {
    __symbolic_assert__(m[0] === "ab", true);
  }
}

// exec captures: a group value is not arbitrary (m[1] need not be "z")
{
  const x = __symbolic__("xd", "ab");
  const m = /^(a)(b)$/.exec(x);
  if (m) {
    __symbolic_assert__(m[1] === "z", false);
  }
}

// search: a matched index is non-negative (valid => detected)
{
  const x = __symbolic__("xe", "abc");
  const i = x.search(/abc/);
  if (i >= 0) {
    __symbolic_assert__(i >= 0, true);
  }
}
