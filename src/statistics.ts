import * as acorn from 'acorn';
import type { AnyNode, Program } from 'acorn';
import { ancestor } from 'acorn-walk';
import { stringify, writeFile } from './utils.js';

const FEATURE_STRINGS = [
  'async functions',
  'generator functions',
  'async generator functions',
  'default parameters',
  'rest parameters',
  'rest/spread bindings',
  'let declarations',
  'const declarations',
  'class declarations',
  'class inheritance',
  'class expressions',
  'arrow functions',
  'for-await-of loops',
  'for-of loops',
  'tagged template literals',
  'template literals',
  'bigint literals',
  'numeric separators',
  'exponentiation operator',
  'nullish coalescing',
  'logical assignment operators',
  'optional chaining',
  'yield* expressions',
  'yield expressions',
  'await expressions',
  'top-level await',
  'destructuring patterns',
  'object spread properties',
  'spread expressions',
  'computed property names',
  'object shorthand properties',
  'object method definitions',
  'private accessors',
  'private methods',
  'class accessors',
  'class methods',
  'class static fields',
  'class instance fields',
  'private fields',
  'private member access',
  'class static blocks',
  'import declarations',
  'export declarations',
  'dynamic import',
  'new.target',
  'import.meta',
  'optional catch binding',
] as const;

export type FeatureString = (typeof FEATURE_STRINGS)[number];
export type FeatureCounts = Partial<Record<FeatureString, number>>;
export type StatFile = {
  es6Features: FeatureCounts;
};

function increment(counts: FeatureCounts, feature: FeatureString, amount: number = 1): void {
  counts[feature] = (counts[feature] ?? 0) + amount;
}

function parseForStats(code: string): Program | null {
  const parseOptions = {
    allowHashBang: true,
    allowReturnOutsideFunction: true,
    ecmaVersion: 2025 as const,
    sourceType: 'module' as const,
  };

  try {
    return acorn.parse(code, parseOptions);
  } catch (_moduleError) {
    try {
      return acorn.parse(code, { ...parseOptions, sourceType: 'script' });
    } catch (_scriptError) {
      return null;
    }
  }
}

function isFunctionNode(node: AnyNode | undefined): boolean {
  return node !== undefined
    && (
      node.type === 'FunctionDeclaration'
      || node.type === 'FunctionExpression'
      || node.type === 'ArrowFunctionExpression'
    );
}

function getParent(ancestors: AnyNode[]): AnyNode | undefined {
  return ancestors.length >= 2 ? ancestors[ancestors.length - 2] : undefined;
}

function isTopLevelAwait(ancestors: AnyNode[]): boolean {
  for (let index = ancestors.length - 2; index >= 0; index -= 1) {
    if (isFunctionNode(ancestors[index])) {
      return false;
    }
  }
  return true;
}

function recordFunctionFeatures(counts: FeatureCounts, node: any): void {
  if (node.async) increment(counts, 'async functions');
  if (node.generator) increment(counts, 'generator functions');
  if (node.async && node.generator) increment(counts, 'async generator functions');

  for (const param of node.params ?? []) {
    if (param.type === 'AssignmentPattern') {
      increment(counts, 'default parameters');
    }
    if (param.type === 'RestElement') {
      increment(counts, 'rest parameters');
      increment(counts, 'rest/spread bindings');
    }
  }
}

export function toStatFile(counts: FeatureCounts): StatFile {
  return { es6Features: counts };
}

export function writeStatFile(filename: string, counts: FeatureCounts): void {
  writeFile(filename, `${stringify(toStatFile(counts))}\n`);
}

export function recordStat(code: string): FeatureCounts {
  const ast = parseForStats(code);
  if (ast === null) {
    return {};
  }

  const counts: FeatureCounts = {};

  ancestor(ast, {
    VariableDeclaration(node: any) {
      if (node.kind === 'let') increment(counts, 'let declarations');
      if (node.kind === 'const') increment(counts, 'const declarations');
    },

    ClassDeclaration(node: any) {
      increment(counts, 'class declarations');
      if (node.superClass) increment(counts, 'class inheritance');
    },

    ClassExpression(node: any) {
      increment(counts, 'class expressions');
      if (node.superClass) increment(counts, 'class inheritance');
    },

    FunctionDeclaration(node: any) {
      recordFunctionFeatures(counts, node);
    },

    FunctionExpression(node: any) {
      recordFunctionFeatures(counts, node);
    },

    ArrowFunctionExpression(node: any) {
      increment(counts, 'arrow functions');
      recordFunctionFeatures(counts, node);
    },

    ForOfStatement(node: any) {
      increment(counts, node.await ? 'for-await-of loops' : 'for-of loops');
    },

    TaggedTemplateExpression() {
      increment(counts, 'tagged template literals');
    },

    TemplateLiteral(_node: any, ancestors: AnyNode[]) {
      const parent = getParent(ancestors);
      if (parent?.type !== 'TaggedTemplateExpression') {
        increment(counts, 'template literals');
      }
    },

    Literal(node: any) {
      if (typeof node.value === 'bigint') {
        increment(counts, 'bigint literals');
      }
      if (typeof node.raw === 'string' && node.raw.includes('_')) {
        increment(counts, 'numeric separators');
      }
    },

    BinaryExpression(node: any) {
      if (node.operator === '**') {
        increment(counts, 'exponentiation operator');
      }
    },

    LogicalExpression(node: any) {
      if (node.operator === '??') {
        increment(counts, 'nullish coalescing');
      }
    },

    AssignmentExpression(node: any) {
      if (node.operator === '&&=' || node.operator === '||=' || node.operator === '??=') {
        increment(counts, 'logical assignment operators');
      }
    },

    ChainExpression() {
      increment(counts, 'optional chaining');
    },

    YieldExpression(node: any) {
      increment(counts, node.delegate ? 'yield* expressions' : 'yield expressions');
    },

    AwaitExpression(_node: any, ancestors: AnyNode[]) {
      increment(counts, 'await expressions');
      if (isTopLevelAwait(ancestors)) {
        increment(counts, 'top-level await');
      }
    },

    ArrayPattern() {
      increment(counts, 'destructuring patterns');
    },

    ObjectPattern() {
      increment(counts, 'destructuring patterns');
    },

    RestElement(_node: any, ancestors: AnyNode[]) {
      const parent = getParent(ancestors);
      if (!isFunctionNode(parent)) {
        increment(counts, 'rest/spread bindings');
      }
    },

    SpreadElement(_node: any, ancestors: AnyNode[]) {
      const parent = getParent(ancestors);
      if (parent?.type === 'ObjectExpression') {
        increment(counts, 'object spread properties');
      } else {
        increment(counts, 'spread expressions');
      }
    },

    Property(node: any) {
      if (node.computed) increment(counts, 'computed property names');
      if (node.shorthand) increment(counts, 'object shorthand properties');
      if (node.method) increment(counts, 'object method definitions');
    },

    MethodDefinition(node: any) {
      if (node.computed) increment(counts, 'computed property names');

      if (node.key?.type === 'PrivateIdentifier') {
        if (node.kind === 'get' || node.kind === 'set') {
          increment(counts, 'private accessors');
        } else {
          increment(counts, 'private methods');
        }
      } else if (node.kind === 'get' || node.kind === 'set') {
        increment(counts, 'class accessors');
      } else if (node.kind !== 'constructor') {
        increment(counts, 'class methods');
      }
    },

    PropertyDefinition(node: any) {
      increment(counts, node.static ? 'class static fields' : 'class instance fields');
      if (node.computed) increment(counts, 'computed property names');
      if (node.key?.type === 'PrivateIdentifier') {
        increment(counts, 'private fields');
      }
    },

    MemberExpression(node: any) {
      if (node.property?.type === 'PrivateIdentifier') {
        increment(counts, 'private member access');
      }
    },

    StaticBlock() {
      increment(counts, 'class static blocks');
    },

    ImportDeclaration() {
      increment(counts, 'import declarations');
    },

    ExportNamedDeclaration() {
      increment(counts, 'export declarations');
    },

    ExportDefaultDeclaration() {
      increment(counts, 'export declarations');
    },

    ExportAllDeclaration() {
      increment(counts, 'export declarations');
    },

    ImportExpression() {
      increment(counts, 'dynamic import');
    },

    MetaProperty(node: any) {
      if (node.meta?.name === 'new' && node.property?.name === 'target') {
        increment(counts, 'new.target');
      }
      if (node.meta?.name === 'import' && node.property?.name === 'meta') {
        increment(counts, 'import.meta');
      }
    },

    CatchClause(node: any) {
      if (node.param === null) {
        increment(counts, 'optional catch binding');
      }
    },
  });

  return counts;
}
