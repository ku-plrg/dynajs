// Concolic regex model: harder encoder paths — char classes, \d, alternation
// with captures, {m,n} loops, +.

// match (string base) with [a-z] / \d captures: m[2] is a digit, not pinned to 9
{
  const x = __symbolic__("xf", "a1");
  const m = x.match(/^([a-z])(\d)$/);
  if (m) {
    __symbolic_assert__(m[2] === "9", false);
  }
}

// alternation: an anchored (cat|dog) admits exactly those two words
{
  const x = __symbolic__("xg", "cat");
  if (/^(cat|dog)$/.test(x)) {
    __symbolic_assert__(x === "cat" || x === "dog", true);
  }
}

// {2,3} loop: an anchored a{2,3} has length >= 2
{
  const x = __symbolic__("xh", "aaa");
  if (/^a{2,3}$/.test(x)) {
    __symbolic_assert__(x.length >= 2, true);
  }
}

// \d+ : at least one character
{
  const x = __symbolic__("xi", "123");
  if (/^\d+$/.test(x)) {
    __symbolic_assert__(x.length >= 1, true);
  }
}
