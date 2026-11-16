// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

namespace TSJ$.Jalangi2 {
    export type UnaryOp = 
        "+" |
        "-" |
        "~" |
        "!" |
        "typeof" |
        "void";

    export type BinaryOp = 
        "+" |
        "-" |
        "*" |
        "/" |
        "%" |
        "<<" |
        ">>" |
        ">>>" |
        "<" |
        ">" |
        "<=" |
        ">=" |
        "==" |
        "!=" |
        "===" |
        "!==" |
        "&" |
        "|" |
        "^" |
        "delete" |
        "instanceof" |
        "in";

    export type Arguments = anything[] | IArguments;
    // it might strictly be appropriate to have two separate types,
    // one for in and one for our. I imagine that the arguments to
    // the handlers will always be IArguments.

    export interface Analysis {
        invokeFunPre?(
            iid:number,
            f:anything,
            base:anything,
            args:Arguments,
            isConstructor:boolean,
            isMethod:boolean,
            functionIid?:number,
            functionSid?:number,
        ):{
            f:anything;
            base:anything;
            args:Arguments;
            skip:boolean;
        };

        invokeFun?(
            iid:number,
            f:anything,
            base:anything,
            args:Arguments,
            result:anything,
            isConstructor:boolean,
            isMethod:boolean,
            functionIid?:number,
            functionSid?:number,
        ):{
            result:anything;
        };

        literal?(
            iid:number,
            val:anything,
            hasGetterSetter:anything,
        ):{
            result:anything;
        };
        
        forinObject?(
            iid:number,
            val:anything,
        ):{
            result:anything;
        };
        
        declare?(
            iid:number,
            name:anything, //TODO: is name a string?
            val:anything,
            isArgument:boolean,
            argumentIndex:number,
            isCatchParam:boolean,
        ):{
            result:anything;
        };
        
        getFieldPre?(
            iid:number,
            base:anything,
            offset:anything,
            isComputed:boolean,
            isOpAssign:boolean,
            isMethodCall:boolean,
        ):{
            base:anything;
            offset:anything;
            skip:boolean;
        };
        
        getField?(
            iid:number,
            base:anything,
            offset:anything,
            val:anything,
            isComputed:boolean,
            isOpAssign:boolean,
            isMethodCall:boolean,
        ):{
            result:anything;
        };
        
        putFieldPre?(
            iid:number,
            base:anything,
            offset:anything,
            val:anything,
            isComputed:boolean,
            isOpAssign:boolean,
            isMethodCall:boolean,
        ):{
            base:anything;
            offset:anything;
            val:anything;
            skip:boolean;
        };
        
        putField?(
            iid:number,
            base:anything,
            offset:anything,
            val:anything,
            isComputed:boolean,
            isOpAssign:boolean,
            isMethodCall:boolean,
        ):{
            result:anything;
        };

        read?(
            iid:number,
            name:anything, //TODO: is name a string?
            val:anything,
            isGlobal:boolean,
            isScriptLocal:boolean,
        ):{
            result:anything;
        };

        write?(
            iid:number,
            name:anything, //TODO: is name a string?
            val:anything,
            lhs:anything, //TODO: what type is lhs?
            isGlobal:boolean,
            isScriptLocal:boolean,
        ):{
            result:anything;
        };

        _return?(
            iid:number,
            val:anything,
        ):{
            result:anything;
        };

        _throw?(
            iid:number,
            val:anything,
        ):{
            result:anything;
        };

        _with?(
            iid:number,
            val:anything,
        ):{
            result:anything;
        };

        functionEnter?(
            iid:number,
            f:anything, //TODO: can we be more specific about the type of f?
            dis:anything, //TODO: what is this?
            args:Arguments,
        ):void; //TODO: is this return type correct?

        functionExit?(
            iid:number,
            returnVal:anything,
            wrappedExceptionVal:anything,
        ):{
            returnVal:anything;
            wrappedExceptionVal:anything;
            isBacktrack:boolean;
        };

        scriptEnter?(
            iid:number,
            instrumentedFileName:string,
            originalFileName:string,
        ):void; //TODO: is this return type correct?

        scriptExit?(
            iid:number,
            wrappedExceptionVal:anything,
        ):{
            wrappedExceptionVal:anything;
            isBacktrack:boolean;
        };

        binaryPre?(
            iid:number,
            op:BinaryOp,
            left:anything,
            right:anything,
            isOpAssign:boolean,
            isSwitchCaseComparison:boolean,
            isComputed:boolean,
        ):{
            op:BinaryOp;
            left:anything;
            right:anything;
            skip:boolean;
        };

        binary?(
            iid:number,
            op:BinaryOp,
            left:anything,
            right:anything,
            result:anything,
            isOpAssign:boolean,
            isSwitchCaseComparison:boolean,
            isComputed:boolean,
        ):{
            result:anything;
        };

        unaryPre?(
            iid:number,
            op:UnaryOp,
            left:anything,
        ):{
            op:UnaryOp;
            left:anything;
            skip:boolean;
        };

        unary?(
            iid:number,
            op:UnaryOp,
            left:anything,
            result:anything,
        ):{
            result:anything;
        };

        // note that && and || are considered conditionals, *not* binary operators, and the return value matters (aside from being truthy or falsey) for them!
        conditional?(
            iid:number,
            result:anything,
        ):{
            result:anything;
        };

        instrumentCodePre?(
            iid:number,
            code:string,
            isDirect:boolean,
        ):{
            code:string;
            skip:boolean;
        };

        instrumentCode?(
            iid:number,
            newCode:string,
            newAst:anything, //TODO: what is the right type for this?
            isDirect:boolean,
        ):{
            result:string;
        };

        endExpression?(
            iid:number,
        ):void; //TODO: is this return type right?

        endExecution?(
        ):void; //TODO: is this return type right?

        runInstrumentedFunctionBody?(
            iid:number,
            f:anything, //TODO: can we be more specific about this type?
            functionIid:number,
            functionSid:number,
        ):boolean; //TODO: is this return type right?
    }
}

// DynaJS port: the runtime global is D$; isInstrumented replaces Jalangi's functionIid.
declare var D$:{
    analysis:object;
    isInstrumented(f:TSJ$.anything):boolean;
};
