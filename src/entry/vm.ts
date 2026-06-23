import { createRequire as createVmRequire } from 'node:module';
import { syncBuiltinESMExports } from 'node:module';
import path from 'node:path';
import { full } from 'acorn-walk';
import type { CallbackHint } from '../partial.js';
import { instrument } from '../instrument/main.js';
import {
  getInstrumentedName,
  getStatName,
  log,
  parse,
  warn,
  writeFile,
} from '../utils.js';
import type { RuntimeOptions } from './options.js';

// require is injected by esbuild
const vm = require('node:vm') as typeof import('node:vm');
const mutableVm = vm as any;

let vmCounter = 0;
let patched = false;
const compileWarnings = new Set<string>();
const vmOutputRoot = path.resolve(process.cwd(), '.dynajs', 'vm');

type VmScriptOptions = {
  filename?: string;
};

function writeGeneratedFile(
  filename: string,
  content: string,
  kind: string,
): void {
  try {
    writeFile(filename, content);
  } catch (error) {
    warn(
      `Failed to write generated ${kind} artifact \`${filename}\`: ${String(error)}`,
    );
  }
}

function resolveVmFilename(kind: string, filename: unknown): string {
  if (typeof filename === 'string' && filename.length > 0) {
    return path.isAbsolute(filename)
      ? filename
      : path.resolve(process.cwd(), filename);
  }

  vmCounter += 1;
  return path.join(vmOutputRoot, `${kind}-${vmCounter}.js`);
}

function injectRuntime(contextObject: any): any {
  if (
    contextObject == null ||
    (typeof contextObject !== 'object' && typeof contextObject !== 'function')
  ) {
    return contextObject;
  }

  const runtime = (globalThis as any).D$;
  if (runtime === undefined) {
    return contextObject;
  }

  try {
    Object.defineProperty(contextObject, 'D$', {
      value: runtime,
      configurable: true,
      writable: true,
      enumerable: false,
    });
  } catch {
    try {
      contextObject.D$ = runtime;
    } catch {
      // Ignore contexts that reject mutation and let the original VM call fail naturally if needed.
    }
  }

  return contextObject;
}

function instrumentVmScript(
  code: string,
  kind: string,
  filename: unknown,
  mode: CallbackHint | undefined,
  options: RuntimeOptions,
): string {
  const originalPath = resolveVmFilename(kind, filename);
  const instrumentedPath = getInstrumentedName(originalPath);

  if (options.verbose) {
    log(`Instrumenting (${kind}) ${originalPath} from node:vm...`);
  }

  const instrumentedCode = instrument(code, {
    verbose: options.verbose,
    pos: options.pos,
    isScript: false,
    callbackHint: mode,
    originalPath,
    instrumentedPath,
  });

  writeGeneratedFile(instrumentedPath, instrumentedCode, 'vm');
  return instrumentedCode;
}

function instrumentCompileFunctionBody(
  code: string,
  params: readonly string[],
  filename: unknown,
  mode: CallbackHint | undefined,
  options: RuntimeOptions,
): string {
  const wrapped = `(function(${params.join(', ')}) {\n${code}\n})`;
  const instrumentedWrapped = instrumentVmScript(
    wrapped,
    'compileFunction',
    filename,
    mode,
    options,
  );
  const ast = parse(instrumentedWrapped, true);
  let bodyRange: { start: number; end: number } | undefined;

  full(ast as any, (node: any) => {
    if (bodyRange || node.type !== 'FunctionExpression') return;
    bodyRange = {
      start: node.body.start + 1,
      end: node.body.end - 1,
    };
  });

  if (bodyRange) {
    return instrumentedWrapped.slice(bodyRange.start, bodyRange.end);
  }

  const key =
    typeof filename === 'string' && filename.length > 0
      ? filename
      : '<anonymous>';
  if (!compileWarnings.has(key)) {
    compileWarnings.add(key);
    warn(
      `Failed to extract instrumented body for vm.compileFunction(${key}); falling back to uninstrumented code.`,
    );
  }
  return code;
}

export function isPatched(): boolean {
  return patched;
}

export function registerVmHook(
  mode: CallbackHint | undefined,
  options: RuntimeOptions,
): void {
  if (patched) return;
  patched = true;

  const OriginalScript = vm.Script;
  const originalCreateContext = vm.createContext as any;
  const originalRunInContext = vm.runInContext as any;
  const originalRunInNewContext = vm.runInNewContext as any;
  const originalRunInThisContext = vm.runInThisContext as any;
  const originalCompileFunction = vm.compileFunction as any;

  class PatchedScript extends OriginalScript {
    constructor(code: string, scriptOptions?: VmScriptOptions) {
      super(
        instrumentVmScript(
          code,
          'Script',
          scriptOptions?.filename,
          mode,
          options,
        ),
        scriptOptions,
      );
    }
  }

  mutableVm.Script = PatchedScript;

  mutableVm.createContext = function createContext(
    contextObject?: any,
    contextOptions?: any,
  ) {
    return originalCreateContext.call(
      this,
      injectRuntime(contextObject ?? {}),
      contextOptions,
    );
  };

  mutableVm.createScript = function createScript(
    code: string,
    scriptOptions?: VmScriptOptions,
  ) {
    return new vm.Script(code, scriptOptions);
  };

  mutableVm.runInContext = function runInContext(
    code: string | InstanceType<typeof vm.Script>,
    contextifiedObject: any,
    scriptOptions?: VmScriptOptions,
  ) {
    injectRuntime(contextifiedObject);
    if (typeof code !== 'string') {
      return originalRunInContext.call(
        this,
        code,
        contextifiedObject,
        scriptOptions,
      );
    }
    const nextCode = instrumentVmScript(
      code,
      'runInContext',
      scriptOptions?.filename,
      mode,
      options,
    );
    return originalRunInContext.call(
      this,
      nextCode,
      contextifiedObject,
      scriptOptions,
    );
  };

  mutableVm.runInNewContext = function runInNewContext(
    code: string | InstanceType<typeof vm.Script>,
    contextObject?: any,
    scriptOptions?: VmScriptOptions,
  ) {
    const nextContext = injectRuntime(contextObject ?? {});
    if (typeof code !== 'string') {
      return originalRunInNewContext.call(
        this,
        code,
        nextContext,
        scriptOptions,
      );
    }
    const nextCode = instrumentVmScript(
      code,
      'runInNewContext',
      scriptOptions?.filename,
      mode,
      options,
    );
    return originalRunInNewContext.call(
      this,
      nextCode,
      nextContext,
      scriptOptions,
    );
  };

  mutableVm.runInThisContext = function runInThisContext(
    code: string | InstanceType<typeof vm.Script>,
    scriptOptions?: VmScriptOptions,
  ) {
    if (typeof code !== 'string') {
      return originalRunInThisContext.call(this, code, scriptOptions);
    }
    const nextCode = instrumentVmScript(
      code,
      'runInThisContext',
      scriptOptions?.filename,
      mode,
      options,
    );
    return originalRunInThisContext.call(this, nextCode, scriptOptions);
  };

  mutableVm.compileFunction = function compileFunction(
    code: string,
    params: readonly string[],
    optionsArg?: VmScriptOptions,
  ) {
    const nextCode = instrumentCompileFunctionBody(
      code,
      params ?? [],
      optionsArg?.filename,
      mode,
      options,
    );
    return originalCompileFunction.call(this, nextCode, params, optionsArg);
  };

  syncBuiltinESMExports();

  if (options.verbose) {
    log('Installed node:vm monkey patches.');
  }
}
