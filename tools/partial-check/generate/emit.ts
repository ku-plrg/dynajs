import ts from 'typescript';
import { walk } from '../ast.js';
import { Loaded } from '../program.js';
import { constHookMap } from '../gate.js';
import { loadGetters } from '../extract/getters.js';
import { loadInvokes } from '../extract/invokes.js';
import { generateGetters } from './getters.js';

// Emit a full src/instrument/partial.ts by rewriting the CURRENT file: replace
// each PRIMARY getter's return-expression with the generated disjunction, and
// leave everything else (imports, types, callbackHint data, delegating/always-on
// getters, the shouldWrapThrow structural gate, comments) untouched. So the diff
// is exactly the regenerated coverage — the error-prone part.
//
// The generated primary set = coverage closure (necessary carriers) ∪ the
// current getter's terms (to preserve non-derivable state-closure deps like
// Aw/Y's frame dependency). Coverage-fixable P1 findings therefore appear as
// *added* callbacks; nothing derivable is dropped.
export function emitPartialTs(L: Loaded): { source: string; edits: number } {
  const sf = L.sf('/partial.ts');
  const text = sf.text;
  const constHook = constHookMap(L);
  const emitHook = (n: ts.Node): string | null =>
    ts.isPropertyAccessExpression(n) &&
    ts.isIdentifier(n.expression) &&
    n.expression.text === 'LOG' &&
    constHook.has(n.name.text)
      ? constHook.get(n.name.text)!
      : null;

  const { req, shape } = loadGetters(L);
  const { fires } = loadInvokes(L, universeOf(L));
  const { getterCallbacks } = generateGetters(L, emitHook, fires, req);

  const disjunction = (name: string, indent: string): string => {
    const cbs = new Set<string>([
      ...(getterCallbacks.get(name) ?? []),
      ...(req.get(name) ?? []),
    ]);
    const pad = indent + '    '; // return-expr sits at indent+2; its terms at +4
    const terms = [...cbs].sort().map((c) => `${pad}this.callbackHint.${c}`);
    return terms.length === 1
      ? terms[0].trim()
      : `(\n${terms.join(' ||\n')}\n${indent}  )`;
  };

  // collect [start, end, replacement] for each primary getter's return-expr
  type Edit = { start: number; end: number; text: string };
  const edits: Edit[] = [];
  walk(sf, (n) => {
    if (!ts.isClassDeclaration(n) || n.name?.text !== 'PartialChecker') return;
    for (const m of n.members) {
      if (!ts.isGetAccessorDeclaration(m) || !ts.isIdentifier(m.name)) continue;
      const name = m.name.text;
      if (shape.get(name) !== 'primary' || name === 'shouldWrapThrow') continue;
      const ret = m.body?.statements.find(ts.isReturnStatement);
      if (!ret?.expression) continue;
      const indent = ' '.repeat(m.getStart(sf) - lineStart(text, m.getStart(sf)));
      edits.push({
        start: ret.expression.getStart(sf),
        end: ret.expression.getEnd(),
        text: disjunction(name, indent),
      });
    }
  });

  // apply in reverse so earlier offsets stay valid
  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return { source: out, edits: edits.length };
}

const lineStart = (text: string, pos: number): number => {
  const nl = text.lastIndexOf('\n', pos - 1);
  return nl + 1;
};
function universeOf(L: Loaded): Set<string> {
  return loadGetters(L).universe;
}
