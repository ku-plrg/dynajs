// Real-sort arithmetic: a symbolic `number` is modeled over the reals, so real
// division and non-integer constants are now solved instead of lost. Each block
// is single-path (its seed selects the branch the assert is coherent with).

// Real division: 7/2 === 3.5 pins x to 7 (would be lost under integer division).
{
  const x = __symbolic__('rd', 7);
  if (x / 2 === 3.5) {
    __symbolic_assert__(x === 7, true);
  }
}

// A non-integer constant is a Real literal, not an unsupported constant: x===0.5
// implies x<1.
{
  const x = __symbolic__('rc', 0.5);
  if (x === 0.5) {
    __symbolic_assert__(x < 1, true);
  }
}

// x>2 does NOT pin x to 2.5 (x=3 also satisfies it), so x===2.5 stays falsifiable.
{
  const x = __symbolic__('rf', 2.5);
  if (x > 2) {
    __symbolic_assert__(x === 2.5, false);
  }
}

// Real modulo follows JS truncated semantics: within (5,6), x % 2 === 1.5 pins
// x to 5.5 (the remainder is periodic, so the range is what makes it provable).
{
  const x = __symbolic__('rm', 5.5);
  if (x > 5 && x < 6 && x % 2 === 1.5) {
    __symbolic_assert__(x === 5.5, true);
  }
}
