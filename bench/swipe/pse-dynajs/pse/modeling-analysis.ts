namespace TSJ$.PSE {

    // This ties the modeling and effect system to an actual Jalangi2 analysis.

    export class ModelingAnalysis extends Hook.HookAnalysis {
        constructor(
            private modelingContext:ModelingContext,
            private valueChooser:ValueChooser,
        ) {
            super();
        }

        handleCall(call: Hook.Call): anything {
            let effect:Effect;
            try {
                effect = this.modelingContext.model(call);
            } catch(e) {
                throw Util.throwInternalError("Modeler failed on call",call,"with error:",e as anything);
            }

            while(!(effect instanceof ReturnEffect)) {
                if(effect instanceof ValueChoosingEffect) {
                    effect = effect.do(this.valueChooser);
                } else if(effect instanceof ReversibleEffect) {
                    effect = effect.do().next;
                    //for backtracking: store reverse
                } else /* (effect instanceof IrreversibleEffect) */ {
                    //for backtracking: contemplate whether we actually want to proceed
                    effect = effect.do();
                }
            }

            return effect.value;
        }
    }
}