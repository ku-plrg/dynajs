/// <reference path="model.ts" />
/// <reference path="modeling-analysis.ts" />
/// <reference path="symbols/literal.ts" />
/// <reference path="symbols/string-concat.ts" />

// this is where things are allowed to get messy
// all other code should be nice and sortof reusable

// TODO: catch caught exceptions
// TODO: add a way of ensuring that we don't have garbage on the stack (check that it's empty on functionExit/scriptExit)
// TODO: make a unitish test that accounts for that

// TODO: make unit tests for && and ||

// TODO: surround everything in try...catch when possible


namespace TSJ$.PSE {

    function notify() {
        if (document.readyState === 'complete') {
            var url = window.location.host + window.location.pathname;
            console.log("url = "+url);
            console.log("window.location.origin = "+window.location.origin);
            remoteLogger.sendMessage("onload", "@@@loading finished@@@ <url>"+url+"</url>");
        }
    }

    var call_sequence_count:number = 0;
    var call_sequence_log_count:number = 0;

    document.addEventListener('readystatechange', notify, false)

    function printStrReCalls(call:Hook.Call)
    {
        // let's check what ppl use in the several regex funct calls
        if (call instanceof Hook.FunctionCall &&
            call.f instanceof Function)
        {
            let s:String = "{";
            if ( isLikeString(call.base) ) {
                s += "String.";

                if (call.f.name === "split") { // str.split([separator[, limit]])
                    s += call.f.name;
                    s += "[" + String(call.args.length) + "]";

                    if (call.args[0] &&
                        call.args[0] !== undefined
                        // ! Symbolic.instanceOf(call.args[0]) &&
                        // isLikeString(call.args[0])
                    ) {
                        s = s + " " + Util.basicDebugToString(call.args[0]);
                    }
                    if (call.args[1] &&
                        call.args[1] !== undefined
                        // ! Symbolic.instanceOf(call.args[1]) &&
                        // isLikeString(call.args[1])
                    ) {
                        s = s + ", " + Util.basicDebugToString(call.args[1]);
                    }
                    s += "} : " + call_sequence_count; call_sequence_count += 1;
                    console.log(s)
                }
                else if (call.f.name === "match") { // str.match(regexp)
                    s += call.f.name;
                    s += "[" + String(call.args.length) + "]";

                    if (call.args[0] &&
                        call.args[0] !== undefined
                        // ! Symbolic.instanceOf(call.args[0]) &&
                        // isLikeString(call.args[0])
                    ) {
                        s = s + " " + Util.basicDebugToString(call.args[0]);
                    }
                    s += "} : " + call_sequence_count; call_sequence_count += 1;
                    console.log(s)
                }
                else if (call.f.name === "replace") { // str.replace(regexp|substr, newSubstr|function)
                    s += call.f.name;
                    s += "[" + String(call.args.length) + "]";

                    if (call.args[0] &&
                        call.args[0] !== undefined
                        // ! Symbolic.instanceOf(call.args[0]) &&
                        // isLikeString(call.args[0])
                    ) {
                        s = s + " " + Util.basicDebugToString(call.args[0]);
                    }
                    if (call.args[1] &&
                        call.args[1] !== undefined
                        // ! Symbolic.instanceOf(call.args[1]) &&
                        // isLikeString(call.args[1])
                    ) {
                        s = s + ", " + Util.basicDebugToString(call.args[1]);
                    }
                    s += "} : " + call_sequence_count; call_sequence_count += 1;
                    console.log(s)
                }
                else if (call.f.name === "search") { // str.search(regexp)
                    s += call.f.name;
                    s += "[" + String(call.args.length) + "]";

                    if (call.args[0] &&
                        call.args[0] !== undefined
                        // ! Symbolic.instanceOf(call.args[0]) &&
                        // isLikeString(call.args[0])
                    ) {
                        s = s + " " + Util.basicDebugToString(call.args[0]);
                    }
                    s += "} : " + call_sequence_count; call_sequence_count += 1;
                    console.log(s)
                }
            }
            else if ( isLikeNumber(call.base) ) {
                s += " Number ";
                s += "} : " + call_sequence_count; call_sequence_count += 1;
                console.log(s)
            }
            else if ( isLikeBoolean(call.base) ) {
                s += " Boolean ";
                s += "} : " + call_sequence_count; call_sequence_count += 1;
                console.log(s)
            }
            else if ( call.base instanceof RegExp ) {
                s += "RegExp(";
                s += Util.basicDebugToString(call.base);
                s += ").";
                s += call.f.name;
                s += "[" + String(call.args.length) + "]";

                for (var i in call.args) {

                    if (call.args[i] &&
                        call.args[i] !== undefined
                        // ! Symbolic.instanceOf(call.args[0]) &&
                        // isLikeString(call.args[0])
                    ) {
                        s = s + " " + Util.basicDebugToString(call.args[i]);
                    }
                }

                s += "} : " + call_sequence_count; call_sequence_count += 1;
                console.log(s)
            }
        }
    }


    let concretizer:Concretizer = <U>(x:Symbolic<U>) => {
        // someday, rather than returning "the" concrete value, we can totally
        // disregard the "real" values and ask the SMT solver to give us one
        // that will send us down the path we want
        if(x.isType(Type.string)) {
            switch(x as Symbolic<string>) {
                case hrefInputSymbol:
                    return Unsafe.cast(Saved.window_location.href);
                case searchInputSymbol:
                    return Unsafe.cast(Saved.window_location.search);
                case hashInputSymbol:
                    return Unsafe.cast(Saved.window_location.hash);
                case cookieInputSymbol:
                    return Unsafe.cast(Saved.document.cookie);
                case referrerInputSymbol:
                    return Unsafe.cast(Saved.document.referrer);
            }
        }

        if (x.isType(Type.string) || x.isType(Type.boolean) || x.isType(Type.integer)) {
            let ret_val = sym_obj_to_sym_var.get(x as Symbolic<anything>);
            if (ret_val){
                return Unsafe.cast(ret_val.get_saved_value());
            }
        }
        
        return x.concretize(concretizer);
    };

    const constraints:Util.SafeSet<SMT.S> = new Util.SafeSet;

    export function clear_constraints(){
        constraints.clear();
    }

    export function REGISTER_TOUPLOWCASE(s1:string, s2:string) {
        remoteLogger.sendMessage("UPLOWCASE",{
            content: s1,
            tocase: s2,
        });
    }

    const vars:Util.SafeSet<SMT.S> = new Util.SafeSet;
    export function REGISTER_OOB(decl:string,opposite:string) {
        if(!vars.has(decl)) {
            vars.add(decl);
            remoteLogger.sendMessage("OOB_DECL",{
                smt: decl,
                opposite: opposite,
            });
        }
    }
    const symbolicarray:Util.SafeSet<string> = new Util.SafeSet;
    export function REGISTER_SYMBOLIC(splitarray:string) {
        symbolicarray.add(splitarray);
    }
    export function CHECK_SYMBOLIC(splitarray:string) {
        if(symbolicarray.has(splitarray)) {
            remoteLogger.sendMessage("Find_OOB_Case",{
                ID : splitarray
            });
        }
        return symbolicarray.has(splitarray);
    }

    let valueChooser:ValueChooser = <U>(x:Symbolic<U>,reason:string,DONTRECORD?:boolean) => {
        let val = concretizer(x);

        if(DONTRECORD) {
            return val;
        }

        if(
            typeof val == "string" ||
            typeof val == "boolean" ||
            (typeof val == "number" && integer.is(val))
        ) {
            let smtCtx = new SMT.FormatterContext();
            let smt:SMT.S = new Symbols.Equals(
                valueOfHandler,
                x,
                new Symbols.LiteralSymbol(
                    val,
                    x.type,
                    valueOfHandler
                )
            ).asSMT(smtCtx);
            //console.log(smtCtx);
            if(smtCtx.variables.size() > 0) {
                //console.log(!constraints.has(smt))
                if(!constraints.has(smt)) {
                    constraints.add(smt);
                    if(reason.indexOf("unmodeled") == 0) {
                        if (DEBUG_lastCall instanceof Hook.FunctionCall &&
                            DEBUG_lastCall.f instanceof Function)
                            console.info("UNMODELED: "+DEBUG_lastCall.f.name);
                        else
                            console.info("UNMODELED:",DEBUG_lastCall);
                        remoteLogger.sendMessage("log_unmodeled",{
                            smt: smt,
                            reason: reason,
                        });
                    }
                    else{
                        remoteLogger.sendMessage("chose_value",{
                            smt: smt,
                            reason: reason,
                        });
                    }
                }
            }
        }
        return val;
    };

    // let callStack:Util.SafeStack<Hook.Call> = new Util.SafeStack;

    // let valueOfHandler:ValueOfHandler = <U>(x:Symbolic<U>) => {
    export var valueOfHandler:ValueOfHandler = <U>(x:Symbolic<U>) => {
	    // let str = callStack.length() > 0 ? callToString(callStack.peek()) : 'undefined';
        return Unsafe.cast(valueChooser(x,"value_of"));
    };

    let encoder:Encoder = new Encoder(valueOfHandler);

    export class StrSearchSymbol<T> extends Symbolic<T> {
        constructor(
            type:Type<T>,
            valueOfHandler:ValueOfHandler,
            private val :T,
            private readonly smtLabel:string,
        ) {
            super(type,valueOfHandler);
        }
        concretize(): T {
            return this.val;
        }
        asSMT(c:SMT.FormatterContext): string {
            c.registerVariable(this.smtLabel,this.type);
            return this.smtLabel;
        }
    }

    export class InputSymbol<T> extends Symbolic<T> {
        constructor(
            type:Type<T>,
            valueOfHandler:ValueOfHandler,
            private readonly smtLabel:string,
        ) {
            super(type,valueOfHandler);
        }
        concretize(): T {
            throw Util.throwInternalError("Calling InputSymbol.concretize() is nonsense");
        }
        asSMT(c:SMT.FormatterContext): string {
            c.registerVariable(this.smtLabel,this.type);
            return this.smtLabel;
        }
    }
    export const searchInputSymbol:InputSymbol<string>
        = new InputSymbol<string>(Type.string,valueOfHandler,"search");
    export const hashInputSymbol:InputSymbol<string>
        = new InputSymbol<string>(Type.string,valueOfHandler,"hash");
    export const cookieInputSymbol:InputSymbol<string>
        = new InputSymbol<string>(Type.string,valueOfHandler,"cookie");
    export const referrerInputSymbol:InputSymbol<string>
        = new InputSymbol<string>(Type.string,valueOfHandler,"referrer");

    /* Maps symbolic variable to object containing saved value, and other info */
    export var sym_obj_to_sym_var = new Map<Symbolic<anything>,PSE.SymbolicVariable>();

    /* Maps tuple [base, offset] to symbolic variable */
    export var con_obj_to_sym_var = new Map<anything,PSE.SymbolicVariable[]>();

    let constantPart = (
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname
    );
    export const hrefInputSymbol:Symbolic<string>
        = new Symbols.StringConcat(
            valueOfHandler,
            new Symbols.StringConcat(
                valueOfHandler,
                new Symbols.LiteralSymbol(
                    constantPart,
                    Type.string,
                    valueOfHandler,
                ),
                searchInputSymbol,
            ),
            hashInputSymbol,
        )

    let DEBUG_lastCall:Hook.Call|undefined;

    let modeler:ModelingContext = new ModelingContext((call:Hook.Call) => {
        let input = isInput(call,encoder);
        if(input) {
            return new ReturnEffect(input);
        }


        let modeled = Models.comprehensive(call,modeler);
        if(modeled) {
            return modeled;
        }
        else { // looks like we encountered a function that is unmodeled

            // was it a function call?
            if (call instanceof Hook.FunctionCall &&
                call.f instanceof Function)
            {
                // was it called with symbolic stuff?
                let calledWSym:boolean = Symbolic.instanceOf(call.base);
                for (var a of call.args) {
                    if (calledWSym) break;
                    calledWSym = (calledWSym || Symbolic.instanceOf(a));
                }

                // we log unmodeled call only if a funct was invoked with symbolic stuff
                if (calledWSym) {
                    remoteLogger.sendUntimedMessage("unmodeled call", umcallToLogString(call), call_sequence_log_count);
                    call_sequence_log_count += 1;

                    printStrReCalls(call);
                }
            }

        }

        let str = callToString(call);

        DEBUG_lastCall = call;
        return Models.argumentDecoderWrapper(
            "unmodeled " + str
        )(call,modeler);
    },encoder);

    function umcallToLogString(call:Hook.Call) {
        let s:String = "[";

        if (
            call instanceof Hook.FunctionCall ||
            call instanceof Hook.GetFieldCall ||
            call instanceof Hook.SetFieldCall
        ) {
            if ( isLikeString(call.base) ) {
                s += " String ";
            }
            else if ( isLikeNumber(call.base) ) {
                s += " Number ";
            }
            else if ( isLikeBoolean(call.base) ) {
                s += " Boolean ";
            }
            else if ( call.base instanceof RegExp ) {
                s += " RegExp ";
            }
        }

        if(call instanceof Hook.FunctionCall) {
            let fn = call.f instanceof Function
                ? call.f.name
                : "?";
            s += "function: " + fn;
        }
        else if(
            call instanceof Hook.BinaryCall
        ) {
            s += "binary: " + call.op;
        }
        else if(
            call instanceof Hook.UnaryCall
        ) {
            s += "unary: " + call.op;
        }
        else if(
            call instanceof Hook.GetFieldCall
        ) {
            let o = typeof call.offset == "string"
                ? call.offset
                : "?"
            s += "get field " + o;
        }
        else if(
            call instanceof Hook.SetFieldCall
        ) {
            let o = typeof call.offset == "string"
                ? call.offset
                : "?"
            s += "set field " + o;
        }
        else {
            s += "conditional";
        }

        s += "]";
        return s;
    }

    function callToString(call:Hook.Call) {
        //TODO: ideally, we would print arguments
        //      however, we have to be really careful not to call Symbolic.toString,
        //      (which will call choose value which will lead to a loop...), and
        //      adding the infrastructure to do that right will take too much time
        if(call instanceof Hook.FunctionCall) {
            let fn = call.f instanceof Function
                ? call.f.name
                : "?";
            return "[call function: " + fn + "]";
        }
        else if(
            call instanceof Hook.BinaryCall
        ) {
            return "[call binary: " + call.op + "]";
        }
        else if(
            call instanceof Hook.UnaryCall
        ) {
            return "[call unary: " + call.op + "]";
        }
        else if(
            call instanceof Hook.GetFieldCall
        ) {
            let o = typeof call.offset == "string"
                ? call.offset
                : "?"
            return "[call get field " + o + "]";
        }
        else if(
            call instanceof Hook.SetFieldCall
        ) {
            let o = typeof call.offset == "string"
                ? call.offset
                : "?"
            return "[call set field " + o + "]";
        }
        else {
            return "[call conditional]";
        }
    }

    function hasSymbolicArguments(call:Hook.Call) {
        let ret = false;
        Hook.applyToCallArguments(call,(x) => {
            if(x instanceof Symbolic) {
                ret = true;
            }
            return x;
        });
        return ret;
    }

    function checkForSinks(call:Hook.Call,context:ModelingContext) {
        if(
            call instanceof Hook.FunctionCall
        ) {
            if(
                (
                    call.f === Saved.document_write ||   // We can add more sink function here
                    call.f === Saved.document_writeln ||
                    call.f === eval
                ) &&
                hasSymbolicArguments(call)
            ) {
                // console.log('[-] Found a sink');
                let smtCtx = new SMT.FormatterContext();
                let test:Symbolic<anything>=context.encoder.asSymbolic(call.args[0]);
                let smt:SMT.S = test.asSMT(smtCtx);
                if(smtCtx.variables.size() > 0){
                    console.warn("taint into sink!",call);
                    console.log(call.f);
                    console.log(call.args);
                    remoteLogger.sendMessage("Found XSS",{
                        href: window.location.href,
                        host: window.location.hostname
                    });
                }
            }
        }
        //TODO: this function is highly incomplete.
        // also we probably don't care so maybe we should just delete this
    }

    D$.analysis = new class extends ModelingAnalysis {
        handleCall(call: Hook.Call): anything {
            // callStack.push(call);

            checkForSinks(call,modeler);

            //out-of-band (OOB) stuff breaks testing
            //ModelTesting.testModelAndLog(call,modeler,concretizer);

            const ret = super.handleCall(call,);
            // callStack.pop();
            return ret;
        }
    } (
        modeler,
        valueChooser
    );
    function isInput(call:Hook.Call,encoder:Encoder) {
        let ret:Symbolic<anything>|undefined;
        if(call instanceof Hook.GetFieldCall) {

            if (call.base === Object(call.base)) // check call.base is an object, not primitive
            {

                // call.base would be the actual object
                let call_base = Object(call.base);
                let call_offset = String(call.offset);

                if (IsSymbolicField(call_base, call_offset))
                {
                    return GetSymbolicField(call_base, call_offset);
                }

                // console.log("GetFieldCall: "+(call.toString())+"; offset="+String(call.offset));
            }

            // if (call.base instanceof RegExp) {
            //     console.log("RegExp "+String(call.base)+"; call.offset = "+String(call.offset));
            // }

            if(call.base === window.location) {
                if(call.offset === "href") {
                    return hrefInputSymbol;
                } else if(call.offset === "search") {
                    return searchInputSymbol;
                } else if(call.offset === "hash") {
                    return hashInputSymbol;
                }
            }


            let ret_val = con_obj_to_sym_var.get(call.base);
            if (ret_val){
                for (var i = 0; i < ret_val.length; i++){
                    if (ret_val[i].get_attr() == call.offset){
                        return ret_val[i].get_input_symbol();
                    }
                }
            }

            /*
            if(call.base == document) {
                if(call.offset === "cookie") {
                    return cookieInputSymbol;
                } else if(call.offset === "referrer") {
                    return referrerInputSymbol;
                }
            }
            */
        }
        return;
    }

    remoteLogger.sendMessage("page_init",{
        href: window.location.href,
        constantPart: constantPart,
        host: window.location.hostname,
    });
}
