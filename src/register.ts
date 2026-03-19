// loader.mjs
export async function resolve(specifier: any, context: any, next: any) {
  // specifier 조작, 로그, 가상 모듈 매핑 등
  return next(specifier, context);
}

export async function load(url: any, context: any, next: any) {
  console.log('loading...', url)
  const result = await next(url, context);
  // result.source 변환 (트랜스파일, 인젝션 등)
  return result;
}
