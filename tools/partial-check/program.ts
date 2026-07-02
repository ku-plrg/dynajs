import ts from 'typescript';

// A bound TypeScript Program (not just a parsed SourceFile) so the checker's
// symbol table is available for scope-correct def-use / alias resolution.
export interface Loaded {
  program: ts.Program;
  checker: ts.TypeChecker;
  all: ts.SourceFile[];
  sf(suffix: string): ts.SourceFile;
}

export function load(root: string): Loaded {
  const configPath = ts.findConfigFile(root, ts.sys.fileExists, 'tsconfig.json');
  if (!configPath) throw new Error(`no tsconfig.json under ${root}`);
  const cfg = ts.readConfigFile(configPath, ts.sys.readFile).config;
  const parsed = ts.parseJsonConfigFileContent(cfg, ts.sys, root);
  const program = ts.createProgram(parsed.fileNames, {
    ...parsed.options,
    noEmit: true,
    // createProgram cannot build a `tsc -b` reference graph; drop composite bits
    composite: false,
    incremental: false,
  });
  const checker = program.getTypeChecker();
  const all = program.getSourceFiles().filter((f) => !f.isDeclarationFile);
  const sf = (suffix: string): ts.SourceFile => {
    const f = all.find((x) => x.fileName.endsWith(suffix));
    if (!f) throw new Error(`source file not found: ${suffix}`);
    return f;
  };
  return { program, checker, all, sf };
}
