namespace TSJ$.PSE.ModelTesting {
    export function testModel(
        call:Hook.Call,
        context:ModelingContext,
        concretizer:Concretizer,
    ):[anything,anything]|undefined {
        let effect:Effect = context.model(call);

        while(!(effect instanceof ReturnEffect)) {
            //console.log("effect",call,effect);
            if(effect instanceof ValueChoosingEffect) {
                effect = effect.do(concretizer);
            } else if(effect instanceof ReversibleEffect) {
                return undefined;
            } else /* (effect instanceof IrreversibleEffect) */ {
                return undefined;
            }
        }

        const modeledDecodedResult:anything
            = Symbolic.instanceOf(effect.value)
                ? concretizer(effect.value)
                : effect.value;

        // note: this assumes that, if our model had no side effects,
        // the concrete call will have no side effects. ideally we
        // wouldn't make that assumption, and we would just have modeled
        // every function to know whether executing it would have side-
        // effects
        // likewise, because we don't allow reversible or irreversible
        // effects when executing the model above, which means exceptions
        // cannot be thrown, we assume that the unmodeled version below
        // will not throw an exception
        const unmodeledResult =
            Hook.executeCall(
                Hook.applyToCallArguments(
                    call,
                    (x) => {
                        return Symbolic.instanceOf(x)
                            ? concretizer(x)
                            : x;
                    }
                )
            );

        return [modeledDecodedResult,unmodeledResult];
    }

    export function testModelAndLog(
            call:Hook.Call,
            context:ModelingContext,
            concretizer:Concretizer,
        ):void {
        const testResult = testModel(call,context,concretizer);
        if(testResult === undefined) {
            //console.log("skipping test due to side-effects",call);
        }
        //TODO: a different kind of equality may be in order
        // but realistically, they're all going to be primitive, so
        // it probably doesn't matter
        else if(testResult[0] === testResult[1]) {
            //console.log("test passed");
        } else {
            console.error("test failed",call);
            console.error("  modeled:",testResult[0]);
            console.error("  unmodeled:",testResult[1]);
            //TODO: remoteLogger
        }
    }
}