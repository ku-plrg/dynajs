import type { Analysis } from "@/types/analysis.js";

declare const D$: { analysis: Analysis } & Record<string, any>;

type Sym =
  | { kind: "const"; value: unknown }
  | { kind: "var"; name: string }
  | { kind: "unary"; op: string; operand: Sym }
  | { kind: "binary"; op: string; left: Sym; right: Sym };

const symbolicMap = new WeakMap<object, Sym>();
const primitiveSym = new Map<unknown, Sym>();

function getSym(v: unknown): Sym {
  if (v !== null && (typeof v === "object" || typeof v === "function")) {
    const s = symbolicMap.get(v as object);
    if (s) return s;
  } else {
    const s = primitiveSym.get(v);
    if (s) return s;
  }
  return { kind: "const", value: v };
}

function setSym(v: unknown, sym: Sym): void {
  if (v === null || v === undefined) return;
  if (typeof v === "object" || typeof v === "function") {
    symbolicMap.set(v as object, sym);
  } else {
    primitiveSym.set(v, sym);
  }
}

function symToString(s: Sym): string {
  switch (s.kind) {
    case "const":
      return JSON.stringify(s.value);
    case "var":
      return s.name;
    case "unary":
      return `(${s.op} ${symToString(s.operand)})`;
    case "binary":
      return `(${symToString(s.left)} ${s.op} ${symToString(s.right)})`;
  }
}

const pathConstraints: Array<{ id: number; constraint: Sym; taken: boolean }> = [];

const analysis: Analysis = {
  invokeFun(_id, f, _base, args, result, _isConstructor, _isMethod) {
    const name = typeof f === "function" ? f.name : undefined;
    if (name && name.startsWith("__sym_")) {
      setSym(result, { kind: "var", name: name.slice(6) || `sym${(args as unknown[]).length}` });
    }
  },

  binary(_id, op, left, right, result) {
    setSym(result, { kind: "binary", op, left: getSym(left), right: getSym(right) });
  },

  unary(_id, op, _prefix, operand, result) {
    setSym(result, { kind: "unary", op, operand: getSym(operand) });
  },

  condition(id, _op, value) {
    const sym = getSym(value);
    if (sym.kind !== "const") {
      pathConstraints.push({ id, constraint: sym, taken: Boolean(value) });
    }
  },

  endExecution() {
    D$.analysis.result = {
      pathConstraints: pathConstraints.map((p) => ({
        id: p.id,
        taken: p.taken,
        constraint: symToString(p.constraint),
      })),
    };
    if (pathConstraints.length > 0) {
      console.error(`[concolic] collected ${pathConstraints.length} path constraint(s):`);
      for (const p of pathConstraints) {
        console.error(`  id=${p.id} taken=${p.taken} ${symToString(p.constraint)}`);
      }
    }
  },
};

D$.analysis = analysis;
