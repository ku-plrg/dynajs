// -----------------------------------------------------------------------------
interface FullAnalysis {
  // ---------------------------------------------------------------------------
  // Script lifecycle
  // ---------------------------------------------------------------------------

  /** Called once all scripts have finished and the process is about to exit. */
  endExecution: () => void;

  /**
   * Called when a script begins execution.
   * @param id - Unique source location identifier.
   * @param instrumentedPath - Path of the instrumented (rewritten) file.
   * @param originalPath - Path of the original source file.
   */
  scriptEnter: (
    id: number,
    instrumentedPath: string,
    originalPath: string,
  ) => void;

  /**
   * Called when a script finishes execution (normally or via exception).
   * @param id - Unique source location identifier.
   * @param exc - Present and set to `{ exception }` if the script threw.
   */
  scriptExit: (id: number, exc?: { exception: any }) => void;

  // ---------------------------------------------------------------------------
  // Function calls — Pre/Post pair
  // ---------------------------------------------------------------------------

  /**
   * Called before a function is invoked. Return value can replace `f`, `base`, `args`,
   * or set `skip: true` to suppress the call entirely and return `undefined`.
   *
   * **Hierarchy:** fires before the more-specific {@link taggedTemplatePre} when the call
   * is a tagged template literal.
   *
   * @param id - Source location identifier.
   * @param f - The function (or constructor) being called.
   * @param base - The `this` receiver (`undefined` for plain calls).
   * @param args - The argument list.
   * @param isConstructor - `true` when called with `new`.
   * @param isMethod - `true` when called as a method (`obj.method(...)`).
   * @returns Replacement `{ f, base, args, skip }`, or `void` to keep originals.
   */
  invokeFunPre: (
    id: number,
    f: any,
    base: any,
    args: any,
    isConstructor: boolean,
    isMethod: boolean,
  ) => { f: any; base: any; args: any; skip: boolean; frame?: unknown } | void;

  /**
   * Called after a function returns (or is skipped via `invokeFunPre`).
   *
   * **Hierarchy:** fires before the more-specific {@link taggedTemplate} when the call
   * was a tagged template literal.
   *
   * @param id - Source location identifier.
   * @param f - The function that was called.
   * @param base - The `this` receiver.
   * @param args - The argument list.
   * @param result - The actual return value.
   * @param isConstructor - `true` when called with `new`.
   * @param isMethod - `true` when called as a method.
   * @returns `{ result }` to replace the return value, or `void`.
   */
  invokeFun: (
    id: number,
    f: any,
    base: any,
    args: any,
    result: any,
    isConstructor: boolean,
    isMethod: boolean,
    frame: unknown,
  ) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Tagged template literals — specific sub-pair of invokeFun/invokeFunPre
  // ---------------------------------------------------------------------------

  /**
   * Called before a tagged template literal is evaluated.
   * Fires **after** {@link invokeFunPre}; its return value takes precedence.
   *
   * @param id - Source location identifier.
   * @param f - The tag function.
   * @param base - The `this` receiver of the tag function.
   * @param strings - The cooked/raw strings array.
   * @param values - The interpolated expression values.
   * @param isMethod - `true` when the tag is a method call.
   * @returns Replacement `{ f, base, strings, values, skip }`, or `void`.
   */
  taggedTemplatePre: (
    id: number,
    f: any,
    base: any,
    strings: any,
    values: any[],
    isMethod: boolean,
  ) => {
    f: any;
    base: any;
    strings: any;
    values: any[];
    skip: boolean;
    frame?: unknown;
  } | void;

  /**
   * Called after a tagged template literal returns.
   * Fires **after** {@link invokeFun}; its return value takes precedence.
   *
   * @param id - Source location identifier.
   * @param f - The tag function.
   * @param base - The `this` receiver.
   * @param strings - The cooked/raw strings array.
   * @param values - The interpolated expression values.
   * @param result - The return value of the tag function.
   * @param isMethod - `true` when the tag is a method call.
   * @returns `{ result }` to replace the return value, or `void`.
   */
  taggedTemplate: (
    id: number,
    f: any,
    base: any,
    strings: any,
    values: any[],
    result: any,
    isMethod: boolean,
    frame: unknown,
  ) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Template literal concatenation — Pre/Post pair (binary)
  // ---------------------------------------------------------------------------

  /**
   * Called before each binary concatenation step inside a template literal.
   * Each interpolated expression fires this twice per TL step: once for
   * `(base, expr)` and once for `(intermediate, quasi)`. The pair-shaped
   * signature lets the hook be reused for non-template string concatenation.
   *
   * @param id - Source location identifier of the template literal.
   * @param left - The accumulated left-hand string.
   * @param right - The next value to concatenate (raw, pre-`ToString`).
   * @returns Replacement `{ left, right, skip }`, or `void`. When `skip` is
   *          true the concatenation is suppressed and the step returns
   *          `undefined`.
   */
  templateConcatPre: (
    id: number,
    left: any,
    right: any,
  ) => { left: any; right: any; skip: boolean; frame?: unknown } | void;

  /**
   * Called after each binary concatenation step inside a template literal
   * (or after it was skipped via {@link templateConcatPre}).
   *
   * @param id - Source location identifier of the template literal.
   * @param left - The left operand at entry.
   * @param right - The right operand at entry.
   * @param result - The concatenated string (`undefined` if skipped).
   * @returns `{ result }` to replace the step's output, or `void`.
   */
  templateConcat: (
    id: number,
    left: any,
    right: any,
    result: any,
    frame: unknown,
  ) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Function body entry / exit
  // ---------------------------------------------------------------------------

  /**
   * Called at the start of a function body (after arguments are bound).
   *
   * @param id - Source location identifier (points to the function definition).
   * @param f - The executing function object.
   * @param base - The `this` value inside the function.
   * @param args - Bound arguments.
   * @param isAsync - `true` for `async` functions.
   * @param isGenerator - `true` for generator functions (`function*`).
   */
  functionEnter: (
    id: number,
    f: any,
    base: any,
    args: any,
    isAsync: boolean,
    isGenerator: boolean,
  ) => void;

  /**
   * Called when a function body exits, whether by `return`, by falling off the end,
   * or by an uncaught exception.
   *
   * @param id - Source location identifier (points to the function definition).
   * @param returnValue - The value being returned (or `undefined` on exception).
   * @param exception - Present and set to `{ exception }` if the function threw.
   * @param isAsync - `true` for `async` functions.
   * @param isGenerator - `true` for generator functions.
   */
  functionExit: (
    id: number,
    returnValue: any,
    exception: { exception: any } | undefined,
    isAsync: boolean,
    isGenerator: boolean,
  ) => void;

  // ---------------------------------------------------------------------------
  // Return statement
  // ---------------------------------------------------------------------------

  /**
   * Called at a `return` statement, before the function exits.
   *
   * @param id - Source location identifier.
   * @param value - The value being returned.
   * @returns `{ result }` to replace the returned value, or `void`.
   */
  _return: (id: number, value: any) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // For-in / for-of
  // ---------------------------------------------------------------------------

  /**
   * Called with the object or iterable before a `for-in` or `for-of` loop starts.
   *
   * @param id - Source location identifier.
   * @param value - The object being iterated.
   * @param isForIn - `true` for `for-in`, `false` for `for-of`.
   * @returns `{ result }` to replace the iterable, or `void`.
   */
  forInOfObject: (
    id: number,
    value: any,
    isForIn: boolean,
  ) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Expression boundary
  // ---------------------------------------------------------------------------

  /**
   * Called at the end of a top-level expression statement.
   * Useful for tracking expression-level side effects without modifying values.
   *
   * @param id - Source location identifier.
   * @param value - The expression's final value.
   */
  endExpression: (id: number, value: any) => void;

  // ---------------------------------------------------------------------------
  // Property access — Pre/Post pairs
  // ---------------------------------------------------------------------------

  /**
   * Called before a property read (`base[prop]` or `base.prop`). Return value can
   * replace `base`/`prop` or set `skip: true` to short-circuit the read.
   *
   * @param id - Source location identifier.
   * @param base - The object being read from.
   * @param prop - The property key.
   * @param isPrivate - `true` for a private field access (`base.#prop`).
   * @returns Replacement `{ base, prop, skip }`, or `void`.
   */
  getFieldPre: (
    id: number,
    base: any,
    prop: any,
    isPrivate: boolean,
  ) => { base: any; prop: any; skip: boolean; frame?: unknown } | void;

  /**
   * Called after a property read completes (or is skipped).
   *
   * **Hierarchy (specific):** fires after the general {@link memoryAccess}; result takes precedence.
   *
   * @param id - Source location identifier.
   * @param base - The object that was read from.
   * @param prop - The property key.
   * @param result - The value that was read.
   * @param isPrivate - `true` for a private field access (`base.#prop`).
   * @returns `{ result }` to replace the read value, or `void`.
   */
  getField: (
    id: number,
    base: any,
    prop: any,
    result: any,
    isPrivate: boolean,
    frame: unknown,
  ) => { result: any } | void;

  /**
   * Called before a property write (`base[prop] = value`). Return value can
   * replace `base`, `prop`, `value`, or set `skip: true` to suppress the write.
   *
   * @param id - Source location identifier.
   * @param base - The object being written to.
   * @param prop - The property key.
   * @param value - The value being written.
   * @param isPrivate - `true` for a private field access (`base.#prop`).
   * @returns Replacement `{ base, prop, value, skip }`, or `void`.
   */
  putFieldPre: (
    id: number,
    base: any,
    prop: any,
    value: any,
    isPrivate: boolean,
  ) => {
    base: any;
    prop: any;
    value: any;
    skip: boolean;
    frame?: unknown;
  } | void;

  /**
   * Called after a property write completes.
   *
   * **Hierarchy (specific):** fires after the general {@link memoryWrite}; result takes precedence.
   *
   * @param id - Source location identifier.
   * @param base - The object that was written to.
   * @param prop - The property key.
   * @param value - The value that was written.
   * @param isPrivate - `true` for a private field access (`base.#prop`).
   * @returns `{ result }` to replace the expression result, or `void`.
   */
  putField: (
    id: number,
    base: any,
    prop: any,
    value: any,
    isPrivate: boolean,
    frame: unknown,
  ) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Property deletion — Pre/Post pair
  // ---------------------------------------------------------------------------

  /**
   * Called before a `delete` expression. Return value can replace `base`/`prop`
   * or set `skip: true` to suppress the deletion.
   *
   * @param id - Source location identifier.
   * @param base - The object whose property will be deleted.
   * @param prop - The property key.
   * @returns Replacement `{ base, prop, skip }`, or `void`.
   */
  _deletePre: (
    id: number,
    base: any,
    prop: any,
  ) => { base: any; prop: any; skip: boolean } | void;

  /**
   * Called after a `delete` expression completes.
   *
   * @param id - Source location identifier.
   * @param base - The object from which the property was deleted.
   * @param prop - The property key.
   * @param value - `true` if the deletion succeeded.
   * @returns `{ result: boolean }` to replace the boolean result, or `void`.
   */
  _delete: (
    id: number,
    base: any,
    prop: any,
    value: boolean,
  ) => { result: boolean } | void;

  // ---------------------------------------------------------------------------
  // Unary operations — general callback
  // ---------------------------------------------------------------------------

  /**
   * Called **before** any unary operation evaluates. Fires for every unary operator.
   *
   * **Hierarchy (general):** also triggers the matching specific Pre callback
   * ({@link arithmeticUnaryPre}, {@link logicalUnaryPre}, etc.) which fires *after*
   * this one; the specific result takes precedence.
   *
   * Operators: `+`, `-`, `!`, `~`, `typeof`, `void`, `++`, `--`
   *
   * @param id - Source location identifier.
   * @param op - The operator string (e.g. `"!"`, `"++"`, `"typeof"`).
   * @param prefix - `true` for prefix position, `false` for postfix.
   * @param operand - The operand value.
   * @returns Replacement `{ op, operand, skip }`, or `void`.
   */
  unaryPre: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
  ) => { op: string; operand: any; skip: boolean; frame?: unknown } | void;

  /**
   * Called **after** any unary operation. Fires for every unary operator.
   *
   * **Hierarchy (general):** also triggers the matching specific callback
   * ({@link arithmeticUnary}, {@link logicalUnary}, etc.) which fires *after*
   * this one; the specific result takes precedence.
   *
   * @param id - Source location identifier.
   * @param op - The operator string.
   * @param prefix - `true` for prefix, `false` for postfix.
   * @param operand - The operand value.
   * @param result - The computed result.
   * @returns `{ result }` to replace the computed value, or `void`.
   */
  unary: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
    result: any,
    frame: unknown,
  ) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Unary operations — specific sub-callbacks  (+, -)
  // ---------------------------------------------------------------------------

  /** Pre-callback for arithmetic unary operators (`+`, `-`). Fires after {@link unaryPre}; result takes precedence. */
  arithmeticUnaryPre: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
  ) => { op: string; operand: any; skip: boolean; frame?: unknown } | void;
  /** Post-callback for arithmetic unary operators (`+`, `-`). Fires after {@link unary}; result takes precedence. */
  arithmeticUnary: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
    result: any,
    frame: unknown,
  ) => { result: any } | void;

  /** Pre-callback for logical unary operator (`!`). Fires after {@link unaryPre}; result takes precedence. */
  logicalUnaryPre: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
  ) => { op: string; operand: any; skip: boolean; frame?: unknown } | void;
  /** Post-callback for logical unary operator (`!`). Fires after {@link unary}; result takes precedence. */
  logicalUnary: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
    result: any,
    frame: unknown,
  ) => { result: any } | void;

  /** Pre-callback for bitwise unary operator (`~`). Fires after {@link unaryPre}; result takes precedence. */
  bitwiseUnaryPre: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
  ) => { op: string; operand: any; skip: boolean; frame?: unknown } | void;
  /** Post-callback for bitwise unary operator (`~`). Fires after {@link unary}; result takes precedence. */
  bitwiseUnary: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
    result: any,
    frame: unknown,
  ) => { result: any } | void;

  /** Pre-callback for `typeof` operator. Fires after {@link unaryPre}; result takes precedence. */
  typeofUnaryPre: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
  ) => { op: string; operand: any; skip: boolean; frame?: unknown } | void;
  /** Post-callback for `typeof` operator. Fires after {@link unary}; result takes precedence. */
  typeofUnary: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
    result: any,
    frame: unknown,
  ) => { result: any } | void;

  /** Pre-callback for `void` operator. Fires after {@link unaryPre}; result takes precedence. */
  voidUnaryPre: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
  ) => { op: string; operand: any; skip: boolean; frame?: unknown } | void;
  /** Post-callback for `void` operator. Fires after {@link unary}; result takes precedence. */
  voidUnary: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
    result: any,
    frame: unknown,
  ) => { result: any } | void;

  /** Pre-callback for update operators (`++`, `--`). Fires after {@link unaryPre}; result takes precedence. */
  updateUnaryPre: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
  ) => { op: string; operand: any; skip: boolean; frame?: unknown } | void;
  /** Post-callback for update operators (`++`, `--`). Fires after {@link unary}; result takes precedence. */
  updateUnary: (
    id: number,
    op: string,
    prefix: boolean,
    operand: any,
    result: any,
    frame: unknown,
  ) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Binary operations — general callback
  // ---------------------------------------------------------------------------

  /**
   * Called **before** any binary operation. Fires for every binary operator.
   *
   * **Hierarchy (general):** also triggers the matching specific Pre callback
   * ({@link arithmeticBinaryPre}, {@link comparisonBinaryPre}, {@link bitwiseBinaryPre})
   * which fires *after* this one; the specific result takes precedence.
   *
   * Operators covered:
   * - Arithmetic: `+`, `-`, `*`, `/`, `%`, `**`
   * - Comparison: `==`, `!=`, `===`, `!==`, `<`, `<=`, `>`, `>=`, `in`, `instanceof`
   * - Bitwise: `&`, `|`, `^`, `<<`, `>>`, `>>>`
   *
   * @param id - Source location identifier.
   * @param op - The operator string (e.g. `"+"`, `"==="`).
   * @param left - The left operand.
   * @param right - The right operand.
   * @returns Replacement `{ op, left, right, skip }`, or `void`.
   */
  binaryPre: (
    id: number,
    op: string,
    left: any,
    right: any,
  ) => {
    op: string;
    left: any;
    right: any;
    skip: boolean;
    frame?: unknown;
  } | void;

  /**
   * Called **after** any binary operation. Fires for every binary operator.
   *
   * **Hierarchy (general):** also triggers the matching specific callback
   * ({@link arithmeticBinary}, {@link comparisonBinary}, {@link bitwiseBinary})
   * which fires *after* this one; the specific result takes precedence.
   *
   * @param id - Source location identifier.
   * @param op - The operator string.
   * @param left - The left operand.
   * @param right - The right operand.
   * @param result - The computed result.
   * @returns `{ result }` to replace the value, or `void`.
   */
  binary: (
    id: number,
    op: string,
    left: any,
    right: any,
    result: any,
    frame: unknown,
  ) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Binary operations — specific sub-callbacks
  // ---------------------------------------------------------------------------

  /**
   * Pre-callback for arithmetic binary operators (`+`, `-`, `*`, `/`, `%`, `**`).
   * Fires after {@link binaryPre}; result takes precedence.
   */
  arithmeticBinaryPre: (
    id: number,
    op: string,
    left: any,
    right: any,
  ) => {
    op: string;
    left: any;
    right: any;
    skip: boolean;
    frame?: unknown;
  } | void;

  /**
   * Post-callback for arithmetic binary operators (`+`, `-`, `*`, `/`, `%`, `**`).
   * Fires after {@link binary}; result takes precedence.
   */
  arithmeticBinary: (
    id: number,
    op: string,
    left: any,
    right: any,
    result: any,
    frame: unknown,
  ) => { result: any } | void;

  /**
   * Pre-callback for comparison operators (`==`, `!=`, `===`, `!==`, `<`, `<=`, `>`, `>=`, `in`, `instanceof`).
   * Fires after {@link binaryPre}; result takes precedence.
   */
  comparisonBinaryPre: (
    id: number,
    op: string,
    left: any,
    right: any,
  ) => {
    op: string;
    left: any;
    right: any;
    skip: boolean;
    frame?: unknown;
  } | void;

  /**
   * Post-callback for comparison operators (`==`, `!=`, `===`, `!==`, `<`, `<=`, `>`, `>=`, `in`, `instanceof`).
   * Fires after {@link binary}; result takes precedence.
   */
  comparisonBinary: (
    id: number,
    op: string,
    left: any,
    right: any,
    result: any,
    frame: unknown,
  ) => { result: any } | void;

  /**
   * Pre-callback for bitwise binary operators (`&`, `|`, `^`, `<<`, `>>`, `>>>`).
   * Fires after {@link binaryPre}; result takes precedence.
   */
  bitwiseBinaryPre: (
    id: number,
    op: string,
    left: any,
    right: any,
  ) => {
    op: string;
    left: any;
    right: any;
    skip: boolean;
    frame?: unknown;
  } | void;

  /**
   * Post-callback for bitwise binary operators (`&`, `|`, `^`, `<<`, `>>`, `>>>`).
   * Fires after {@link binary}; result takes precedence.
   */
  bitwiseBinary: (
    id: number,
    op: string,
    left: any,
    right: any,
    result: any,
    frame: unknown,
  ) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Conditions — general callback
  // ---------------------------------------------------------------------------

  /**
   * Called when any branching condition is evaluated. Fires for every condition site.
   *
   * **Hierarchy (general):** also triggers the matching specific callback
   * ({@link ifCondition}, {@link whileCondition}, {@link logicalAnd}, etc.)
   * which fires *after* this one; the specific result takes precedence.
   *
   * @param id - Source location identifier.
   * @param op - A string identifying the condition type (e.g. `"if"`, `"&&"`, `"?."`)
   * @param value - The condition value (before truthiness coercion).
   * @returns `{ result }` to replace the condition value, or `void`.
   */
  condition: (id: number, op: string, value: any) => { result: any } | void;

  /**
   * Hook for a class heritage expression (`class … extends E`). `value` is the
   * (possibly lifted) heritage; return `{ result }` to replace it with a value
   * the native `class` machinery accepts (a raw constructor or null).
   */
  classHeritage?: (id: number, value: any) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Conditions — specific sub-callbacks
  // ---------------------------------------------------------------------------

  /** Condition value of an `if` / `else if` statement. Fires after {@link condition}; result takes precedence. */
  ifCondition: (id: number, value: any) => { result: any } | void;
  /** Condition value of a `while` or `do-while` loop. Fires after {@link condition}; result takes precedence. */
  whileCondition: (id: number, value: any) => { result: any } | void;
  /** Condition value of a `for` loop. Fires after {@link condition}; result takes precedence. */
  forCondition: (id: number, value: any) => { result: any } | void;
  /** Condition value of a ternary expression (`? :`). Fires after {@link condition}; result takes precedence. */
  ternaryCondition: (id: number, value: any) => { result: any } | void;
  /** Left-hand side of `&&` before the right is evaluated. Fires after {@link condition}; result takes precedence. */
  logicalAnd: (id: number, value: any) => { result: any } | void;
  /** Left-hand side of `||` before the right is evaluated. Fires after {@link condition}; result takes precedence. */
  logicalOr: (id: number, value: any) => { result: any } | void;
  /** Left-hand side of `??` before the right is evaluated. Fires after {@link condition}; result takes precedence. */
  nullishCoalescing: (id: number, value: any) => { result: any } | void;
  /** Guard value of an optional chain (`?.`). Fires after {@link condition}; result takes precedence. */
  optionalChain: (id: number, value: any) => { result: any } | void;
  /** Discriminant of a `switch` statement. Fires after {@link condition}; result takes precedence. */
  switchCondition: (id: number, value: any) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Variable declarations and assignments
  // ---------------------------------------------------------------------------

  /**
   * Called when a variable is declared (and optionally initialized).
   *
   * @param id - Source location identifier.
   * @param name - The declared variable name (or pattern root for destructuring).
   * @param kind - Declaration keyword: `"var"`, `"let"`, `"const"`, or `"param"`.
   * @param init - `true` if the declaration has an initializer.
   * @param value - The initializer value (or `undefined` if none).
   * @param isSpread - `true` if this binding is a rest/spread element.
   */
  declare: (
    id: number,
    name: string,
    kind: string,
    init: boolean,
    value: any,
    isSpread: boolean,
  ) => void;

  // ---------------------------------------------------------------------------
  // Memory access — general callbacks
  // ---------------------------------------------------------------------------

  /**
   * Called for any memory read (property or variable). Acts as the general callback
   * for both {@link getField} (property reads) and {@link read} (identifier reads).
   *
   * **Hierarchy (general):** fires before the specific `getField` or `read`; the
   * specific result takes precedence.
   *
   * @param id - Source location identifier.
   * @param value - The value being read.
   * @returns `{ result }` to replace the read value, or `void`.
   */
  memoryAccess: (id: number, value: any) => { result: any } | void;

  /**
   * Called for a variable identifier read (e.g. referencing `x`).
   * Fires after {@link memoryAccess}; result takes precedence.
   *
   * @param id - Source location identifier.
   * @param name - The variable name.
   * @param value - The current value.
   * @returns `{ result }` to replace the read value, or `void`.
   */
  read: (id: number, name: string, value: any) => { result: any } | void;

  /**
   * Called for any memory write (property or variable). Acts as the general callback
   * for both {@link putField} (property writes) and {@link write} (identifier writes).
   *
   * **Hierarchy (general):** fires before the specific `putField` or `write`; the
   * specific result takes precedence.
   *
   * @param id - Source location identifier.
   * @param value - The value being written.
   * @returns `{ result }` to replace the written value, or `void`.
   */
  memoryWrite: (id: number, value: any) => { result: any } | void;

  /**
   * Called for a variable identifier write (assignment to a named variable).
   * Fires after {@link memoryWrite}; result takes precedence.
   *
   * @param id - Source location identifier.
   * @param names - The variable names being written (multiple for destructuring).
   * @param value - The value being assigned.
   * @returns `{ result }` to replace the assigned value, or `void`.
   */
  write: (id: number, names: string[], value: any) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Literals — general callback
  // ---------------------------------------------------------------------------

  /**
   * Called whenever a literal value is evaluated. Fires for every literal kind.
   *
   * **Hierarchy (general):** also triggers the matching specific callback
   * ({@link numberLiteral}, {@link stringLiteral}, {@link arrayLiteral}, etc.)
   * which fires *after* this one; the specific result takes precedence.
   *
   * @param id - Source location identifier.
   * @param value - The literal value.
   * @returns `{ result }` to replace the literal, or `void`.
   */
  literal: (id: number, value: any) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Literals — specific sub-callbacks
  // ---------------------------------------------------------------------------

  /** Fires for numeric literals. After {@link literal}; result takes precedence. */
  numberLiteral: (id: number, value: any) => { result: any } | void;
  /** Fires for BigInt literals. After {@link literal}; result takes precedence. */
  bigintLiteral: (id: number, value: any) => { result: any } | void;
  /** Fires for string literals. After {@link literal}; result takes precedence. */
  stringLiteral: (id: number, value: any) => { result: any } | void;
  /** Fires for boolean literals (`true`, `false`). After {@link literal}; result takes precedence. */
  booleanLiteral: (id: number, value: any) => { result: any } | void;
  /** Fires for the `null` literal. After {@link literal}; result takes precedence. */
  nullLiteral: (id: number, value: any) => { result: any } | void;
  /** Fires for regular expression literals. After {@link literal}; result takes precedence. */
  regexpLiteral: (id: number, value: any) => { result: any } | void;
  /** Fires for array literals (`[...]`). After {@link literal}; result takes precedence. */
  arrayLiteral: (id: number, value: any) => { result: any } | void;
  /** Fires for object literals (`{...}`). After {@link literal}; result takes precedence. */
  objectLiteral: (id: number, value: any) => { result: any } | void;
  /** Fires for function, arrow function, and class expressions. After {@link literal}; result takes precedence. */
  functionLiteral: (id: number, value: any) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Throw
  // ---------------------------------------------------------------------------

  /**
   * Called at a `throw` statement, before the exception propagates.
   *
   * @param id - Source location identifier.
   * @param val - The value being thrown.
   * @returns `{ result }` to replace the thrown value, or `void`.
   */
  _throw: (id: number, val: any) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Generators
  // ---------------------------------------------------------------------------

  /**
   * Called at a `yield` expression (or `yield*` delegation).
   *
   * @param id - Source location identifier.
   * @param value - The value being yielded.
   * @param isDelegate - `true` for `yield*`.
   * @returns `{ result }` to replace the yielded value, or `void`.
   */
  _yield: (
    id: number,
    value: any,
    isDelegate: boolean,
  ) => { result: any } | void;

  /**
   * Called when a generator is resumed (the value passed into `.next(val)`).
   *
   * @param id - Source location identifier.
   * @param value - The resume value.
   * @returns `{ result }` to replace the resume value, or `void`.
   */
  _resume: (id: number, value: any) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Async / Await
  // ---------------------------------------------------------------------------

  /**
   * Called at an `await` expression, with the value being awaited (before suspension).
   *
   * @param id - Source location identifier.
   * @param value - The value/promise being awaited.
   * @returns `{ result }` to replace the awaited value, or `void`.
   */
  _await: (id: number, value: any) => { result: any } | void;

  /**
   * Called when an `await` resumes with its resolved value.
   *
   * @param id - Source location identifier.
   * @param value - The resolved value.
   * @returns `{ result }` to replace the resolved value, or `void`.
   */
  _awaitResult: (id: number, value: any) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Class field initialization
  // ---------------------------------------------------------------------------

  /**
   * Called when a class field initializer is evaluated (instance or static).
   *
   * @param id - Source location identifier.
   * @param obj - The object (instance or class) the field is being set on.
   * @param key - The field name/symbol.
   * @param isStatic - `true` for static fields.
   * @param value - The initializer value.
   * @returns `{ result }` to replace the initialized value, or `void`.
   */
  fieldInit: (
    id: number,
    obj: any,
    key: any,
    isStatic: boolean,
    value: any,
  ) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Super — constructor call
  // ---------------------------------------------------------------------------

  /**
   * Called before `super(...)` in a derived class constructor.
   *
   * @param id - Source location identifier.
   * @param args - The argument list.
   * @returns `{ args }` to replace the arguments, or `void`.
   */
  superCallPre: (id: number, args: any[]) => { args: any[] } | void;

  /**
   * Called after `super(...)` returns (i.e. the base constructor finishes).
   *
   * @param id - Source location identifier.
   * @param args - The argument list that was passed.
   * @param thisVal - The newly constructed `this` value.
   * @returns `{ result }` to replace `this`, or `void`.
   */
  superCall: (id: number, args: any[], thisVal: any) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Super — method call
  // ---------------------------------------------------------------------------

  /**
   * Called before `super.method(...)`.
   *
   * @param id - Source location identifier.
   * @param thisVal - The current `this`.
   * @param prop - The method name.
   * @param args - The argument list.
   * @returns `{ prop, args }` to replace method/args, or `void`.
   */
  superMethodCallPre: (
    id: number,
    thisVal: any,
    prop: any,
    args: any[],
  ) => { prop: any; args: any[] } | void;

  /**
   * Called after `super.method(...)` returns.
   *
   * @param id - Source location identifier.
   * @param thisVal - The current `this`.
   * @param prop - The method name.
   * @param args - The argument list.
   * @param result - The return value.
   * @returns `{ result }` to replace the return value, or `void`.
   */
  superMethodCall: (
    id: number,
    thisVal: any,
    prop: any,
    args: any[],
    result: any,
  ) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Super — property read
  // ---------------------------------------------------------------------------

  /**
   * Called before `super.prop` (property read).
   *
   * @param id - Source location identifier.
   * @param thisVal - The current `this`.
   * @param prop - The property key.
   * @returns `{ prop }` to replace the key, or `void`.
   */
  superGetFieldPre: (
    id: number,
    thisVal: any,
    prop: any,
  ) => { prop: any } | void;

  /**
   * Called after `super.prop` resolves.
   *
   * @param id - Source location identifier.
   * @param thisVal - The current `this`.
   * @param prop - The property key.
   * @param value - The resolved value.
   * @returns `{ result }` to replace the value, or `void`.
   */
  superGetField: (
    id: number,
    thisVal: any,
    prop: any,
    value: any,
  ) => { result: any } | void;

  // ---------------------------------------------------------------------------
  // Super — property write
  // ---------------------------------------------------------------------------

  /**
   * Called before `super.prop = value`.
   *
   * @param id - Source location identifier.
   * @param thisVal - The current `this`.
   * @param prop - The property key.
   * @param value - The value being assigned.
   * @returns `{ prop, value }` to replace key/value, or `void`.
   */
  superPutFieldPre: (
    id: number,
    thisVal: any,
    prop: any,
    value: any,
  ) => { prop: any; value: any } | void;

  /**
   * Called after `super.prop = value` completes.
   *
   * @param id - Source location identifier.
   * @param thisVal - The current `this`.
   * @param prop - The property key.
   * @param value - The value that was assigned.
   */
  superPutField: (id: number, thisVal: any, prop: any, value: any) => void;

  // ---------------------------------------------------------------------------
  // Eval hooking
  // ---------------------------------------------------------------------------

  /**
   * Called before eval'd code is instrumented. Return value can replace the
   * code string that will be instrumented, or set `skip: true` to skip
   * instrumentation and eval the original code as-is.
   *
   * @param id - Source location identifier (the eval call site).
   * @param code - The code string passed to eval.
   * @param isDirect - `true` for direct eval, `false` for indirect.
   * @returns `{ code, skip }` to replace/skip, or `void`.
   */
  instrumentCodePre: (
    id: number,
    code: string | any,
    isDirect: boolean,
  ) => { code: string | any; skip?: boolean } | void;

  /**
   * Called after eval'd code has been instrumented. Return value can replace
   * the instrumented code string that will actually be eval'd.
   *
   * @param id - Source location identifier (the eval call site).
   * @param code - The instrumented code string.
   * @param isDirect - `true` for direct eval, `false` for indirect.
   * @returns `{ result }` to replace the instrumented code string, or `void`.
   */
  instrumentCode: (
    id: number,
    code: string | any,
    isDirect: boolean,
  ) => { result: string | any } | void;

  result: any;
}

export type Analysis = Partial<FullAnalysis>;
