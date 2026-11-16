namespace TSJ$.PSE {
    export type PartialModeler = (call:Hook.Call,context:ModelingContext) => Effect|undefined;
    export type Modeler = (call:Hook.Call,context:ModelingContext) => Effect;
    export class ModelingContext {
        constructor(
            private modeler:Modeler,
            public encoder:Encoder,
        ) {}
        
        // used for recursive modeling, like concretizing an argument
        // and then calling the whole modeling process again
        model(call:Hook.Call):Effect {
            return this.modeler(call,this);
        }
    }
}
