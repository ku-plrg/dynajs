import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BoolDomain } from './lattice.js';

test('ROBDD is canonical (structural equality = id equality)', () => {
  const d = new BoolDomain();
  const a = d.atom('a'), b = d.atom('b'), c = d.atom('c');
  assert.equal(d.atom('a'), a);
  assert.equal(d.and(a, a), a);
  assert.equal(d.and(a, b), d.and(b, a));
  assert.equal(d.or(a, b), d.or(b, a));
  assert.equal(d.and(a, d.or(a, b)), a); // absorption
  assert.equal(d.or(a, d.and(a, b)), a);
  assert.equal(d.and(a, d.not(a)), d.bottom);
  assert.equal(d.or(a, d.not(a)), d.top);
  assert.equal(d.not(d.not(a)), a);
  assert.equal(d.and(a, d.or(b, c)), d.or(d.and(a, b), d.and(a, c))); // distributive
  assert.equal(d.not(d.and(a, b)), d.or(d.not(a), d.not(b))); // De Morgan
});

test('lattice order', () => {
  const d = new BoolDomain();
  const a = d.atom('a'), b = d.atom('b');
  assert.ok(d.leq(d.bottom, a));
  assert.ok(d.leq(a, d.top));
  assert.ok(d.leq(d.and(a, b), a)); // a∧b ⊑ a
  assert.ok(d.leq(a, d.or(a, b))); // a ⊑ a∨b
  assert.ok(!d.leq(a, b));
  assert.ok(d.equal(d.join(a, b), d.or(a, b)));
});

test('eval = coverage query (gate evaluated at a callback singleton)', () => {
  const d = new BoolDomain();
  const on =
    (...gs: string[]) =>
    (v: string) =>
      gs.includes(v);

  // switch: emitted iff getter C or B on
  const swGate = d.or(d.atom('C'), d.atom('B'));
  assert.equal(d.eval(swGate, on('C')), true);
  assert.equal(d.eval(swGate, on('B')), true);
  assert.equal(d.eval(swGate, on('X')), false);

  // super method call: F && Sm — needs invokeFun too (the conjunction the
  // derivation found). superMethodCall-only must NOT emit it.
  const smGate = d.and(d.atom('F'), d.atom('Sm'));
  assert.equal(d.eval(smGate, on('Sm')), false);
  assert.equal(d.eval(smGate, on('F', 'Sm')), true);
  assert.deepEqual(d.support(smGate), new Set(['F', 'Sm']));
});
