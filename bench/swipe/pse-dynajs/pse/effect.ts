namespace TSJ$.PSE {

    // when we model functions, some of them have effects. but we want our model
    // to be pure, so we return effects which can do the diry work. I think it's
    // vaguely like a monad. Sadly, I don't know Haskell, but a monad is just a
    // monoid in the category of endofunctors, so what's the problem?

    // it's worth noting that effects are chained, and always end with a ReturnEffect

    export abstract class ReversibleEffect {
        abstract do():{
            next:Effect,
            reverse?:()=>void,
        };
    
        static from(f:() => {
            next:Effect,
            reverse?:()=>void,
        }):ReversibleEffect {
            return new class extends ReversibleEffect {
                do() {
                    return f();
                }
            };
        }
    }
    
    export abstract class IrreversibleEffect {
        abstract do():Effect;
    
        static from(f:() => Effect):IrreversibleEffect {
            return new class extends IrreversibleEffect {
                do() {
                    return f();
                }
            };
        }
    }
    
    export type ValueChooser = <U>(x:Symbolic<U>,reason:string,DONTRECORD?:boolean)=>U;

    export abstract class ValueChoosingEffect {
        abstract do(chooser:ValueChooser):Effect;
    
        static from(f:(chooser:ValueChooser) => Effect):ValueChoosingEffect {
            return new class extends ValueChoosingEffect {
                do(chooser:ValueChooser) {
                    return f(chooser);
                }
            };
        }
    }
    
    //TODO: effects should be forbidden from throwing exceptions, but rather
    //      we should add a new ExceptionEffect, or modify ReturnEffect to
    //      wrap exceptions.
    export class ReturnEffect {
        constructor(
            public readonly value:anything
        ) {}
    }
    
    export type Effect = ReversibleEffect | IrreversibleEffect | ValueChoosingEffect | ReturnEffect;

    export namespace Effect {
        export function is(x:anything):x is Effect {
            return (
                x instanceof ReversibleEffect ||
                x instanceof IrreversibleEffect ||
                x instanceof ValueChoosingEffect ||
                x instanceof ReturnEffect
            );
        }
    }

    export class IrreversibleCallEffect extends IrreversibleEffect {
        constructor(
            private readonly call:Hook.Call
        ) {
            super();
        }

        do(): Effect {
            return new ReturnEffect(
                Hook.executeCall(this.call)
            );
        }
    }
}