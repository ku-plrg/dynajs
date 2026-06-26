// Public API of the model layer — the framework surface a user analysis builds
// on (and the entry external consumers like NodeMedic import). Internals
// (Lifted / SpecRuntime / Model / the spec polyfills) stay unexported: a user
// analysis only ever touches `Info` + `Valued` + `Site`.
export { FlowAnalysis } from './flow.js';
export type { CallPolicy } from './flow.js';
export type { Valued, Lifted, Unlifted, Primitive } from './type.js';
export type { Site, CodeSite, Pos } from './internal/site.js';
