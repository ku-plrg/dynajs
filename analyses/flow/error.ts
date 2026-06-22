/**
 * throw this when the model is not capable of handling the given input, e.g. when side-effects are involved, or when the input is too complex for the model to handle.
 */
export class ModelCapableError extends Error {
    static raise(message?: string, reinitialize?: boolean): never {
        throw new ModelCapableError(message, reinitialize);
    }

    constructor(message?: string, public reinitialize?: boolean) {
        super(message);
        this.name = this.constructor.name;
    }
}
