// Concolic model of String.prototype.at. Adapted to single-path from a
// multi-path bench: each block uses its own seed so the asserted property is
// coherent with the branch that seed takes (one run = one path, so an assert
// can't expect a value the path condition already pins).

// A defined char at index 1 implies the string is longer than 1.
{
  const s = __symbolic__('at_len', 'aaa');
  if (s.at(1) === 'a') {
    __symbolic_assert__(s.length > 1, true);
  }
}

// `at(1) !== 'z'` constrains the char but does NOT pin it to 'a', so
// `at(1) === 'a'` stays falsifiable (clean) rather than provable.
{
  const s = __symbolic__('at_val', 'bbb');
  if (s.at(1) !== 'z') {
    __symbolic_assert__(s.at(1) === 'a', false);
  }
}
