export function AO__StringToBigInt ($ : SpecRuntime, string : Wrapped<string>): Wrapped<bigint> {
  return $.base(BigInt($.peek(string)), [string]);
}