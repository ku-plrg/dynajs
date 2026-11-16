namespace TSJ$.Hook {

    // Hook provides a nicer interface than a raw Jalangi2 analysis for the case
    // where you don't much care about the inner workings of the code, but rather
    // just want to hook into native calls.

    let concretizer:PSE.Concretizer = <U>(x:PSE.Symbolic<U>) => {
        // someday, rather than returning "the" concrete value, we can totally
        // disregard the "real" values and ask the SMT solver to give us one
        // that will send us down the path we want
        if(x.isType(Type.string)) {
            switch(x as PSE.Symbolic<string>) {
                case PSE.hrefInputSymbol:
                    return Unsafe.cast(Saved.window_location.href);
                case PSE.searchInputSymbol:
                    return Unsafe.cast(Saved.window_location.search);
                case PSE.hashInputSymbol:
                    return Unsafe.cast(Saved.window_location.hash);
                case PSE.cookieInputSymbol:
                    return Unsafe.cast(Saved.document.cookie);
                case PSE.referrerInputSymbol:
                    return Unsafe.cast(Saved.document.referrer);
            }   
        }
        
        if (x.isType(Type.string) || x.isType(Type.boolean) || x.isType(Type.integer)) {
            let ret_val = PSE.sym_obj_to_sym_var.get(x as PSE.Symbolic<string>);
            if (ret_val){
                return Unsafe.cast(ret_val.get_saved_value());
            }
        }

        return x.concretize(concretizer);
    };

    export class UnaryCall {
        // these "type" fields are really to aid in debugging. A more general
        // way of printing the class name to the console would be nicer.
        readonly type = "unary";

        constructor(
            public readonly op:Jalangi2.UnaryOp,
            public readonly left:anything,
        ) {}

        toString() {
            return (
                "[call unary: " +
                this.op +
                " " +
                Util.basicDebugToString(this.left) +
                "]"
            );
        }
    }

    export class BinaryCall {
        readonly type = "binary";

        constructor(
            public readonly op:Jalangi2.BinaryOp,
            public readonly left:anything,
            public readonly right:anything,
        ) {}

        toString() {
            return (
                "[call binary: " +
                Util.basicDebugToString(this.left) +
                " " +
                this.op +
                " " +
                Util.basicDebugToString(this.right) +
                "]"
            );
        }
    }

    export class FunctionCall {
        readonly type = "function";

        constructor(
            public readonly ctor:boolean,
            public readonly f:anything,
            public readonly base:anything,
            public readonly args:anything[],
        ) {}

        toString() {
            return (
                "[call function: " +
                (this.ctor ? "new " : "") +
                Util.basicDebugToString(this.base) +
                "." +
                Util.basicDebugToString(this.f) +
                "(" +
                Util.basicDebugToString(this.args) +
                ")]"
            );
        }
    }

    export class GetFieldCall {
        readonly type = "get_field";

        constructor(
            public readonly base:anything,
            public readonly offset:anything,
        ) {}

        toString() {
            return (
                "[call get: " +
                Util.basicDebugToString(this.base) +
                "[" +
                Util.basicDebugToString(this.offset) +
                "]]"
            );
        }
    }

    export class SetFieldCall {
        readonly type = "set_field";

        constructor(
            public readonly base:anything,
            public readonly offset:anything,
            public readonly value:anything,
        ) {}

        toString() {
            return (
                "[call get: " +
                Util.basicDebugToString(this.base) +
                "[" +
                Util.basicDebugToString(this.offset) +
                "] = " +
                Util.basicDebugToString(this.value) +
                "]"
            );
        }
    }

    export class ConditionalCall {
        readonly type = "conditional";

        constructor(
            public readonly condition:anything,
        ) {}

        toString() {
            return (
                "[call conditional: " +
                Util.basicDebugToString(this.condition) +
                "]"
            );
        }
    }

    export type Call = UnaryCall | BinaryCall | FunctionCall | GetFieldCall | SetFieldCall | ConditionalCall;

    // DynaJS port: replacements for J$.util.callUnary/callBinary/callFun
    function callUnary(op:Jalangi2.UnaryOp,x:unsafe):anything {
        switch(op) {
            case "+": return +x;
            case "-": return -x;
            case "~": return ~x;
            case "!": return !x;
            case "typeof": return typeof x;
            case "void": return void x;
            default: throw Error("unknown unary op " + op);
        }
    }

    function callBinary(op:string,l:unsafe,r:unsafe):anything {
        switch(op) {
            case "+": return l + r;
            case "-": return l - r;
            case "*": return l * r;
            case "/": return l / r;
            case "%": return l % r;
            case "<<": return l << r;
            case ">>": return l >> r;
            case ">>>": return l >>> r;
            case "<": return l < r;
            case ">": return l > r;
            case "<=": return l <= r;
            case ">=": return l >= r;
            case "==": return l == r;
            case "!=": return l != r;
            case "===": return l === r;
            case "!==": return l !== r;
            case "&": return l & r;
            case "|": return l | r;
            case "^": return l ^ r;
            case "delete": return delete l[r];
            case "instanceof": return l instanceof r;
            case "in": return r in l;
            case "**": return l ** r;
            default: throw Error("unknown binary op " + op);
        }
    }

    function callFun(f:unsafe,base:anything,args:anything[],isConstructor:boolean):anything {
        return isConstructor ? Reflect.construct(f,args) : Clean.apply(f,base,args);
    }

    export function executeCall(call:Call):anything {
        let val:anything;
        if(call instanceof GetFieldCall) {
            val = Unsafe.getField(call.base,call.offset);
        } else if(call instanceof SetFieldCall) {
            val = Unsafe.setField(call.base,call.offset,call.value);
        } else if(call instanceof UnaryCall) {
            val = callUnary(call.op,call.left);
        } else if(call instanceof BinaryCall) {
            val = callBinary(call.op,call.left,call.right);
        } else if (call instanceof FunctionCall) {
            val = callFun(call.f,call.base,call.args,call.ctor);
        } else /* if(call instanceof NativeHandler.ConditionalCall) */ {
            val = call.condition;
        }

        return val;
    }

    //TODO: this only does a shallow sort of application. in particular, it's
    //      usually used to check for Symbolic objects, and it won't find things
    //      deeper within an argument. While that's probably fine, it could also
    //      subtley bite us down the road.
    export function applyToCallArguments<T = Call>(
        call:T,
        f:(x:anything) => anything,
    ):T {
        let ret;
        if(call instanceof GetFieldCall) {
            ret = new GetFieldCall(f(call.base),f(call.offset));
        } else if(call instanceof SetFieldCall) {
            ret = new SetFieldCall(f(call.base),f(call.offset),f(call.value));
        } else if(call instanceof UnaryCall) {
            ret = new UnaryCall(call.op,f(call.left));
        } else if(call instanceof BinaryCall) {
            ret = new BinaryCall(call.op,f(call.left),f(call.right));
        } else if(call instanceof FunctionCall) {
            let nargs:anything[] = [];
            for(let i = 0; i < call.args.length; i ++) {
                Clean.Array_push(nargs,f(call.args[i]));
            }
            ret = new FunctionCall(call.ctor,f(call.f),f(call.base),nargs);
        } else if(call instanceof ConditionalCall) {
            ret = new ConditionalCall(f(call.condition));
        } else {
            throw new Error();
        }

        return Unsafe.cast(ret);
    }

    interface FunctionFrame {
        invokeFunStack:Util.SafeStack<anything>;
        binaryStack:Util.SafeStack<anything>;
        unaryStack:Util.SafeStack<anything>;
        getFieldStack:Util.SafeStack<anything>;
        setFieldStack:Util.SafeStack<anything>;
    };

    function newFunctionFrame():FunctionFrame {
        return {
            invokeFunStack: new Util.SafeStack,
            binaryStack: new Util.SafeStack,
            unaryStack: new Util.SafeStack,
            getFieldStack: new Util.SafeStack,
            setFieldStack: new Util.SafeStack,
        };
    };

    // DynaJS port: update operators reach unaryPre/unary as well
    function isUpdate(op:string):boolean {
        return op === "++" || op === "--";
    }

    export abstract class HookAnalysis {
        private readonly frames:Util.SafeStack<FunctionFrame> = new Util.SafeStack;
        private readonly __instrumentation_enabled = true;

        abstract handleCall(call:Call):anything;

        private tryHandleCall(call:Call):anything {
            return this.handleCall(call);
        }

        private isConcolic(obj: anything): obj is PSE.Symbolic<anything> {
            return PSE.Symbolic.instanceOf(obj);
        }

        invokeFunPre(
            iid:number,
            f:anything,
            base:anything,
            args:Jalangi2.Arguments,
            isConstructor:boolean,
            isMethod:boolean,
        ) {
            if (!this.__instrumentation_enabled) {
                return {
                    f: f,
                    base: base,
                    args: args,
                    skip: false,
                }
            }
            let hasConcolicArguments = this.isConcolic(base);
            for (let i in args) {
                hasConcolicArguments = hasConcolicArguments || this.isConcolic(args[i]);
            }
            // NOTE: !D$.isInstrumented(f) ==> f is a native (or uninstrumented) function
            // skip means that we will not actually perform the operation
            // in question; in this case, the invocation of f. If we do skip
            // our analysis is responsible for providing the result of f's
            // invocation. We need to do this to ensure that we properly
            // handle concolic arguments for native function calls.
            let skip = !D$.isInstrumented(f) && hasConcolicArguments;
            return {
                f: f,
                base: base,
                args: args,
                skip: skip,
            };
        }

        invokeFun(
            iid:number,
            f:anything,
            base:anything,
            args:Jalangi2.Arguments,
            result:anything,
            isConstructor:boolean,
            isMethod:boolean,
        ) {
            if (!this.__instrumentation_enabled) {
                return {
                    result: result,
                }
            }
            let ret = result;
            let hasConcolicArguments = this.isConcolic(base);
            for (let i in args) {
                hasConcolicArguments = hasConcolicArguments || this.isConcolic(args[i]);
            }
            if (!D$.isInstrumented(f) && hasConcolicArguments) {
                let concolicResult = null;
                try {
                    let call = new FunctionCall(isConstructor, f, base, TSJ$.Saved.Array_from(args));
                    concolicResult = this.tryHandleCall(call);
                } catch (err) {
                    throw Error(`Unhandled failed concolic function call: ${err}`);
                }
                ret = concolicResult == null ? ret : concolicResult;
            }
            if((globalThis as any).make_symbolic){
                if (f === (globalThis as any).make_symbolic){
                    /* Reset PSE constraint list so that different executions can log the same path conditions if needed */
                    PSE.clear_constraints();

                    let sym_obj;
                    if (args[4] === "String"){
                        sym_obj = new PSE.InputSymbol<string>(Type.string,PSE.valueOfHandler,args[2]);
                    }
                    else if (args[4] === "Bool"){
                        sym_obj = new PSE.InputSymbol<boolean>(Type.boolean,PSE.valueOfHandler,args[2]);
                    }
                    else {
                        /* This should never happen */
                        console.log("[ERROR] Invalid symbolic input type passed to make_symbolic")
                        return  {
                            result: ret,
                        };
                    }
                    let sym_var = new PSE.SymbolicVariable(args[0], args[1], args[3], sym_obj);
                    PSE.sym_obj_to_sym_var.set(sym_obj, sym_var);
                    if (!PSE.con_obj_to_sym_var.has(args[0])){
                        var list_var : PSE.SymbolicVariable[] = [];
                        PSE.con_obj_to_sym_var.set(args[0], list_var);
                    }
                    let list = PSE.con_obj_to_sym_var.get(args[0]);

                    if (list){
                        let new_one = true;
                        for (var i = 0; i < list.length; i++){
                            if (list[i].get_attr() == args[1]){
                                list[i].set_saved_value(args[3]);
                                new_one = false;
                            }
                        }

                        if (new_one){
                            list.push(sym_var);
                        }
                    }
                }
            }
            return {
                result: ret,
            };
        }

        binaryPre(
            iid:number,
            op:Jalangi2.BinaryOp,
            left:anything,
            right:anything,
        ) {
            if (!this.__instrumentation_enabled) {
                return {
                    op: op,
                    left: left,
                    right: right,
                    skip: false,
                }
            }
            let skip = this.isConcolic(left) || this.isConcolic(right);
            return {
                op: op,
                left: left,
                right: right,
                skip: skip,
            };
        }

        binary(
            iid:number,
            op:Jalangi2.BinaryOp,
            left:anything,
            right:anything,
            result:anything,
        ) {
            if (!this.__instrumentation_enabled) {
                return {
                    result: result,
                }
            }
            let ret = result;
            if (this.isConcolic(left) || this.isConcolic(right)) {
                // console.log('Concolic binaryOp');
                let concolicResult = null;
                try {
                    concolicResult = this.tryHandleCall(new BinaryCall(op, left, right))
                    if (concolicResult instanceof Error) {
                        concolicResult = null;
                    }
                } catch {
                    throw Error('Unhandled failed concolic binary op');
                }
                ret = concolicResult == null ? ret : concolicResult;
            }
            return {
                result: ret,
            };
        }

        unaryPre(
            iid:number,
            op:Jalangi2.UnaryOp,
            prefix:boolean,
            left:anything,
        ) {
            if (!this.__instrumentation_enabled) {
                return {
                    op: op,
                    operand: left,
                    skip: false,
                }
            }
            // DynaJS port: ++/-- also arrive here; DynaJS does the arithmetic
            // itself via binaryPre/binary, so never skip them.
            let skip = this.isConcolic(left) && !isUpdate(op);
            return {
                op: op,
                operand: left,
                skip: skip,
            };
        }

        unary(
            iid:number,
            op:Jalangi2.UnaryOp,
            prefix:boolean,
            left:anything,
            result:anything,
        ) {
            if (!this.__instrumentation_enabled) {
                return {
                    result: result,
                }
            }
            let ret = result;
            if (this.isConcolic(left) && !isUpdate(op)) {
                // console.log('Concolic unaryOp');
                let concolicResult = null;
                try {
                    concolicResult = this.tryHandleCall(new UnaryCall(op, left));
                } catch {
                    throw Error('Unhandled failed concolic unary op');
                }
                ret = concolicResult == null ? ret : concolicResult;
            }
            return {
                result: ret,
            };
        }

        getFieldPre(
            iid:number,
            base:anything,
            offset:anything,
        ) {
            if (!this.__instrumentation_enabled) {
                return {
                    base: base,
                    prop: offset,
                    skip: false,
                }
            }
            let skip = this.isConcolic(base) || this.isConcolic(offset);
            return {
                base: base,
                prop: offset,
                skip: skip,
            };
        }
        
        getField(
            iid:number,
            base:anything,
            offset:anything,
            val:anything,
        ) {
            if (!this.__instrumentation_enabled) {
                return {
                    result: val,
                }
            }
            let ret = val;
            if (this.isConcolic(base) || this.isConcolic(offset)) {
                // console.log('Concolic getField');
                let concolicResult = null;
                try {
                    // console.log('Performing symbolic getField');
                    concolicResult = this.tryHandleCall(new GetFieldCall(base, offset));
                } catch {
                    throw Error('Unhandled failed concolic getField');
                }
                ret = concolicResult == null ? ret : concolicResult;
            } else if (base == window.location) {
                // NOTE: Potentially introduce a concolic variable
                // console.log(`Introducing symbolic: ${offset}`);
                if (offset == "href") {
                    ret = PSE.hrefInputSymbol;
                } else if(offset == "search") {
                    ret = PSE.searchInputSymbol;
                } else if(offset == "hash") {
                    ret = PSE.hashInputSymbol;
                }
            }
            else {
                let ret_val = PSE.con_obj_to_sym_var.get(base);
                if (ret_val){
                    for (var i = 0; i < ret_val.length; i++){
                        if (ret_val[i].get_attr() == offset){
                            ret = ret_val[i].get_input_symbol();
                        }
                    }
                }
            }
            return {
                result: ret,
            };
        }

        putFieldPre(
            iid:number,
            base:anything,
            offset:anything,
            val:anything,
        ) {
            if (!this.__instrumentation_enabled) {
                return {
                    base: base,
                    prop: offset,
                    value: val,
                    skip: false,
                }
            }
            let skip = this.isConcolic(base) || this.isConcolic(offset) || this.isConcolic(val);
            return {
                base: base,
                prop: offset,
                value: val,
                skip: skip,
            };
        }
        
        putField( 
            iid:number,
            base:anything,
            offset:anything,
            val:anything,
        ) {
            if (!this.__instrumentation_enabled) {
                return {
                    result: val,
                }
            }
            let ret = val;
            if (this.isConcolic(base) || this.isConcolic(offset) || this.isConcolic(val)) {
                // console.log('Concolic putField');
                let concolicResult = null;
                try {
                    concolicResult = this.tryHandleCall(new SetFieldCall(base, offset, val));
                } catch {
                    throw Error('Unhandled failed concolic putField');
                }
                ret = concolicResult == null ? ret : concolicResult;
            }
            return {
                result: ret,
            };
        }

        // neither documented nor intuitive to me:
        // || and && are instrumented as conditionals, NOT as binary operators
        // for them, the actual return value matters beyond merely being
        // truthy or falsey. as a guideline, return false if you want false,
        // and return "result" if it's truthy and you want true. however,
        // where we could run into trouble is that jalanji provides no
        // provision for returning a wrapped value that you want to be treated
        // as falsey. such a thing would require modifying jalangi2
        condition(
            iid:number,
            op:string,
            result:anything,
        ) {
            if (!this.__instrumentation_enabled) {
                return {
                    result: result,
                }
            }
            let ret = result;
            if (this.isConcolic(result)) {
                // console.log('Concolic conditional');
                let concolicResult = null;
                try {
                    concolicResult = this.tryHandleCall(new ConditionalCall(result));
                } catch (e) {
                    throw Error('Unhandled failed concolic conditional: ' + e);
                }
                ret = concolicResult == null ? ret : concolicResult;
            }
            return {
                result: ret
            };
        };
    }
}