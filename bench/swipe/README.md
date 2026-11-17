# SWIPE (NDSS'26) DSE → DynaJS 포팅 준비

대응 이슈: ku-plrg/dynajs-paper#12 (리뷰 C "더 큰 실제 애플리케이션", 사이드 — 지면 부족하면 뺌).
작성 2026-11-12. 아직 커밋 안 함.

## 1. 결론 요약

- **DynaJS 런타임은 브라우저에서 돈다.** `src/analysis.ts`의 `setBaseObj`를 esbuild로 IIFE 번들(405 KB)하면
  `fs`/`path`만 shim하면 되고, 페이지 안의 `eval`도 브라우저 안에서 on-the-fly로 계측된다.
  SWIPE `tests/example_page.html` 스크립트를 `djx instrument`로 계측해 Chromium에서 돌려 확인함
  (`spike/` — `location.search → includes → if → document.write` 흐름이 콜백으로 관측됨, 런타임 에러 없음).
- **SWIPE 쪽 교체 지점은 세 군데뿐.** (1) mitmproxy `proxy.py`의 계측기 호출, (2) HTML에 런타임+분석 주입,
  (3) 분석 코드의 Jalangi 어댑터. Z3/제약 처리(Python), Fuzzer, taint Chromium, WARC replay는 그대로 둔다.
- **분석 코드의 Jalangi 의존은 얇다.** PSE가 쓰는 `J$` 표면은 `J$.analysis`, `J$.util.callUnary/callBinary/callFun`,
  그리고 `functionIid === undefined`(= native 호출) 판정뿐. 콜백 15개 모두 DynaJS에 1:1 대응이 있다.

## 1.1 진행 상황 (2026-11-12)

**안 A (어댑터 교체) — 동작함.** `pse-dynajs/`는 SWIPE PSE 소스 복사본에서 Jalangi 의존 부분만 고친 것
(`jalangi2.ts`의 `J$` 선언 → `D$`, `hook.ts` 콜백 시그니처/반환 모양, `pse/main.ts` 등록 1줄).
`harness/serve.mjs`(인라인·외부 스크립트를 DynaJS로 계측 + 런타임/PSE 주입, PSE의 XHR 로그는 `window.__pse`로)로
SWIPE `tests/` 25개를 돌리면 23개가 에러 없이 `page_init`/`chose_value`/`Found XSS`와 SMT 제약을 내보냄.
남은 2개(`simpleDOMXSS2REexec`, `testStrMatchGlobal`)는 PSE 정규식 모델 내부 에러 — Jalangi판에서도 나는지 확인 필요.
드라이버: `node bench/swipe/harness/serve.mjs ../swipe-artifact/SWIPE/tests` 후 `/__driver`.

포팅하며 드러난 Jalangi↔DynaJS 의미 차이:
- `getFieldPre`/`putFieldPre` 반환 키: Jalangi `offset`/`val` → DynaJS `prop`/`value`. 틀리면 `base[undefined]`를 읽음.
- `unaryPre`/`unary`에 `prefix` 인자가 추가되고 반환은 `{op, operand}`. `++`/`--`도 이 콜백으로 들어옴.
- **기호 `x++`는 기호를 잃음**: DynaJS `Up`이 `-(-operand)`로 먼저 구체화한 뒤 binary 훅을 부름. Jalangi는 `x = x + 1`로 풀어서 유지. (루프 카운터는 대개 구체값이라 영향 작음 — 논문에 쓸 거면 한계로)
- native 판정: Jalangi `functionIid === undefined` → `D$.isInstrumented(f)`.

**DynaJS 본체에서 고친 버그 2개 (src/, 커밋 안 함)** — 둘 다 브라우저 페이지에서만 드러남:
1. `src/analysis.ts`: 연산자 분류에 쓰던 `Set.prototype.has`를 페이지 폴리필(es6-shim)이 계측된 구현으로 바꾸면
   훅 안에서 다시 훅으로 들어가 스택 오버플로. 빈 분석에서도 재현. → 기존 `CAPTURED` 패턴대로 로드 시점에 bind한
   `CAPTURED.SetHas`로 호출 (`isInstrumented` 캐시도 `CAPTURED.WeakMapGet/Set`). Set 정의는 그대로.
2. `src/instrument/{visitor,state}.ts`: 스크립트 전체를 `try {}`로 감싸서 최상위 `let/const/class`(엄격 모드면 함수 선언도)가
   블록 스코프가 됨 → 다음 `<script>`에서 안 보임 (`Hero is not defined`). Node CJS는 어차피 함수로 감싸서 무관.
   → 새 옵션 `globalLexical`(브라우저용, 기본 off): 최상위 선언은 try 밖, 문장 묶음만 try로 감싸고 catch에서 `X`+`Sx`로
   스크립트를 멈춤. `spike/global-lexical/` 8개 체크가 비계측 페이지와 동일.
   (Jalangi판은 SWIPE가 Babel로 ES5로 내려서 이 문제가 안 생김)
- taint 테스트 42/42 그대로. concolic 유닛 1/4는 수정 전에도 동일(로컬 z3 환경 문제로 보임).
- 덤: `dist/instrument/*.js`는 4월 tsc 산출물(stale). 지금 빌드는 entry만 번들하므로 그 파일을 import하면 옛 계측기가 돔.
  하네스는 `build-browser.mjs`가 src에서 번들한 `dist/instrument.mjs`를 씀.

**Jalangi 기준선 (a5 Docker)**: 이미지 빌드 완료. 아티팩트 `entrypoint.sh`는 `x11vnc ... -forever \ #-localhost &`에서
주석이 `&`를 먹어 영원히 멈춤 → `~/swipe/run-swipe.sh`로 우회. README의 S3 예제 페이지는 404(사라짐) →
컨테이너 안에서 `tests/`를 `swipe.test:8000`으로 서빙 (`run.sh`가 `killall python3` 하므로 node 정적 서버).

**안 B 기반 확인**: `analyses/flow`(FlowAnalysis) + `concolic/src/sym.ts`도 `node:util` shim 하나로 브라우저 번들 됨(165 KB).
SWIPE Python 쪽 계약은 단순: `page_init{href}`, 기호 분기마다 `chose_value{smt}`(택한 경로 조건, `search`/`hash` 변수),
싱크에서 `Found XSS{href}`. Python이 각 choice를 부정해 z3로 풀고 새 URL을 만든다.

## 1.2 SWIPE 파이프라인 연결 (2026-11-12) — `proxy/`, `dataset/`

- `proxy/instrument-server.mjs`: Node 20 상주 계측 서버 (`POST /instrument {code,label,kind}`). 한 프로세스라 id가 페이지의
  모든 스크립트에 걸쳐 증가해 겹치지 않음. `kind:"handler"`는 인라인 이벤트 핸들러 본문(`return` 가능)을
  `D$.__h = function (event) {…}`로 계측하고 속성은 `…; return D$.__h.call(this, event);`. 스니펫마다 시간/실패를
  `/tmp/dynajs-instrument.jsonl`에 기록 → "계측 실패 수" 지표.
- `proxy/proxy.py`: SWIPE `packages/jalangi2/scripts/proxy.py` 복사본 + `instrumenter=dynajs` 분기(+78줄). 기본값은 jalangi.
  DynaJS 모드는 Babel 끄고, BeautifulSoup으로 인라인 스크립트와 모든 `on*` 속성을 서버로 보내고
  (SWIPE의 `domEvents` 목록엔 `onmousewheel`이 없음 — Jalangi는 `on*` 전부 계측), HTML 머리에 런타임+PSE를 인라인.
- `proxy/Dockerfile.swipe-dynajs`: SWIPE 이미지 + Node 20 (기본 이미지는 Node 10).
- `proxy/run-swipe.sh <jalangi|dynajs> <config> <targets>`: 깨진 entrypoint 대체, 테스트 페이지 서빙, dynajs면 proxy 교체.
- **example_page 결과(a5, DSE만)**: 두 판 모두 `?BmustcontainthisstringA?`를 합성해 `vulnerable_dse` 흐름 발견, 279 s.
  차이: Jalangi판은 계측 실행 중 passive `eval` 흐름도 보고. DynaJS의 `Ev`는 새로 생성한 계측 코드를 `eval`에
  넘기는데 taint Chromium이 그 문자열의 taint를 잃는 것으로 보임(Jalangi 출력은 원래 글자가 taint를 유지).
  SWIPE 논문/README 방식대로 **흐름은 DSE가 만든 URL을 비계측 페이지에서 재실행해 셈** → 두 판 공정 비교는 이 방식으로.
- `dataset/prep.py`: 데이터셋 39개 WARC에서 시작 URL(`240.240.240.240/?target=`) 복원 + `archive_store.json` 생성
  (mitmproxy venv 파이썬으로 실행). `dataset/run-page.sh <mode> <id> [budget]`: replay+DSE 1페이지 실행,
  컨테이너 peak memory(2초 샘플)·벽시계 시간 → `results/<mode>/<id>/stats.json`.
- 예산: DSE 방문 1회가 브라우저 타임아웃(~135 s)을 다 기다리고 기본 최대 50회 → 페이지당 최대 ~2시간이라
  `dse-time-budget`으로 제한(파일럿 600 s, 본 실행 900 s 예정).

## 1.3 안 B — DynaJS `FlowAnalysis` 기반 (`dse-dynajs/index.ts`, 2026-11-12)

- `FlowAnalysis<Sym>`(analyses/flow)를 직접 상속(처음엔 `ConcolicAnalysis` 상속이었으나 교체). 값이 연산자와
  내장 함수를 어떻게 지나가는지는 DynaJS의 명세 기반 내장 모델이 처리하고, 이 파일은 "SWIPE에서 기호 값이 무엇인가"
  (search/hash 위의 SMT 항)와 "언제 서버에 보내나"만 정함:
  - 전이 함수(Sym 생성: substr/concat/strlen/contains/binary/unary/min/max/clamp/range)는 concolic의 것을 SWIPE에
    필요한 문자열·숫자 부분만 옮김. 배열·객체 기호화, ExpoSE 드라이버(z3 호출, 입력 재시드, 커버리지)는 없음.
    `sym.ts`의 IR과 `smt.ts`의 `symToSmt`만 재사용.
  - 분기: 사용자 코드든 내장 모델 안이든 기호 분기는 `conditionInfo`에서 곧바로 `chose_value`. 명세 루프의 범위 가드
    (`rangeInfo`, "루프가 한 번 더 돌 수 있나")도 같은 경로(관찰 3). private `pushBranch` 프로토타입 훅은 사라짐.
  - 루프 바운드 사실(binder)은 보내지 않음: SWIPE의 `ADD-CONSTR`은 이후 모든 질의에 전역 assert되어 앞선 분기의
    부정을 unsat으로 만들 수 있음.
  - trim은 기호 유지 안 함(SWIPE preamble에 `str.whiteLeft/Right` 없음; PSE도 trim 모델 없음).
  - 소스/싱크/메시지는 전과 동일: `location.search/hash/href` → `search`, `hash`, 상수부 ++ search ++ hash;
    싱크 `document.write/writeln/eval`(직접 eval은 `instrumentCodePre`); `page_init`, `chose_value`, `Found XSS`, `onload`.
- **PSE 손 모델 fallback** (`opaqueCallInfo`): DynaJS가 모델이 없는 내장 함수는 네이티브로 실행(opaque)되고, PSE에
  모델이 있으면 그걸 씀. 대조 결과 DynaJS에 없고 PSE에 있는 것: `toLowerCase/toUpperCase`, `RegExp.prototype.test/exec`,
  정규식 인자 `String.prototype.search/match/split`. 옮긴 것:
  - case-map 4개(toLower/UpperCase, toLocale*): 항등(PSE와 같음).
  - `RegExp.prototype.test`: `(str.in.re s RE)`, RE는 SWIPE 컨테이너의 정규식→SMT 번역 서비스(`localhost:9222`,
    `re2smtlib.js`, `run-z3js-translator`)에 동기 XHR로 받음(PSE `ReTranslator`와 같음). SMT 원문은 Sym 트리에
    `__rawN_` Bool 변수로 넣었다가 `toSwipeSmt`에서 끼워 넣음. (처음엔 "아티팩트에 번역 서비스가 없다"고 적었는데
    틀림 — 분석 디렉터리 밖 `packages/`에 있었음.)
  - `RegExp.prototype.exec`: PSE처럼 `regexcase{function, pattern}` 전송(서버가 패턴 단어를 search에 넣는 질의를 만듦).
  - 안 옮긴 것: PSE의 String `search`(정규식, 인덱스 ite), 전역 `match`(매치 스택), 정규식 `split`.
  나머지 미모델 호출은 PSE처럼 구체화(결과 비기호)하고 이름별로 `stats.unmodeled`에 셈. (PSE의 `log_unmodeled`,
  `UPLOWCASE` 메시지는 SWIPE 서버가 무시함.)
- 번들: `node:util`(lift.ts의 inspect.custom), `node:child_process`(smt.ts의 z3 드라이버, 호출 안 함) shim 두 개만.
  `fs`/`path`/`process` shim 불필요해짐. DynaJS 쪽 변경은 여전히 `smt.ts`의 `symToSmt` `export` 한 단어.
- 마이크로 테스트 25개: 24개 에러 없음(교체 전과 동일), `testFields3` XSS 추가 보고, 제약 39–57개/테스트.
  `simpleDOMXSS2upperlowercase`에서 fallback 4회 발동. `simpleDOMXSS2REexec`/`testStrMatchGlobal`/
  `testStrSearch`는 에러는 없지만 `exec`/`match`/`search`가 미모델로 구체화됨(이전에 "DynaJS 정규식 모델로 정상"이라
  적은 건 틀림 — 에러가 없었을 뿐).
- **fallback 제거 ablation** (`dist/dse-dynajs-nofb.js`, `__DYNAJS_NO_FALLBACK`): 위 PSE fallback 표를 끄고
  모델 없는 내장 함수를 다른 opaque 호출처럼 구체값으로만 둠. 마이크로 테스트(로컬, 24/26)에서 달라진 것은
  `simpleDOMXSS2REexec`(regexcase 메시지 사라짐)와 `simpleDOMXSS2upperlowercase`(SMT 제약 57→54)뿐이고,
  XSS 발견 여부는 동일. 33페이지 실행은 구현 변경으로 중단(2026-11-16), 재실행 예정.
- **관찰 1 — 제약 수**: `location.href.indexOf("default=")`를 DynaJS는 명세 알고리즘(위치별 비교 루프)으로 모델링 →
  분기 제약이 테스트당 38–54개(PSE는 `str.indexof` 1개). SWIPE는 `chose_value`마다 부정해서 z3를 부르므로
  방문당 solver 호출이 그만큼 늘어남. 원자 연산 단위 모델링의 대가 — 논문에 쓸 만한 관찰.
- **관찰 2 — 폴리필 재진입, 분석 계층**: `testinstr`(es5-shim)는 B에서 스택 오버플로. es5-shim이
  `Array.prototype.map`을 계측된 구현으로 바꾸고, `FlowAnalysis`의 spec-op `default`가 훅 처리 중
  `parents.map(...)`을 호출 → 다시 훅. 런타임은 고쳤지만 `analyses/flow`, `analyses/concolic`에 훅 경로의 live 빌트인
  호출이 ~100곳 있음(`flow/utils.ts`가 이미 "index loop 사용" 규칙을 적어둔 것과 어긋남). 별도 작업으로 하드닝 필요.
- **관찰 3 — 루프 가드**: example_page에서 B가 처음엔 분기 0개 → DSE URL 0개. `location.search.includes(
  "mustcontainthisstring")`에서 needle(21자)이 `?gp`(3자)보다 길면 명세 검색 루프가 0번 돌아 분기가 없고,
  "search가 짧다"는 사실은 `rangeInfo`의 루프 범위 가드(`pushBranch`)로만 기록됨. B가 그것도 `chose_value`로
  보내도록 고침 → `(not (<= 0 (- (str.len search) 21)))`. 부정하면 "search ≥ 21자" → 다음 방문에서 루프가 돌며
  위치별 제약. PSE는 `str.contains` 한 번이라 한 번에 풀지만 B는 방문이 여러 번 필요.
  - 결과(a5, 파이프라인): B가 **5번째 방문**에서 `?mustcontainthisstring`을 만들어 `vulnerable_dse` 1건 도달
    (`?gp` → 길이 20 → 21 → 위치별 제약 → 정답). PSE/Jalangi는 2번째 방문(279 s). 이후 B는 언롤된 위치별 제약을
    계속 부정하며 SWIPE 시간 한도까지 51번 방문(6,934 s, 방문당 약 136 s) — 명세 수준 모델의 경로 폭발.
    논문 서술: "B는 손 모델 없이 같은 흐름을 찾지만, 내장 함수가 명세 루프로 풀려 탐색 방문 수가 늘어난다."

## 1.4 데이터셋 DSE 실행 1차 — Jalangi vs 안 A (2026-11-12, a5, 900 s, 6병렬, Passive에서 열리는 33쪽)

`summarize.py results results/ok-ids.txt` 결과. potential = 계측된 DSE 실행 중 보고된 흐름(확인 재실행 전).

| | Jalangi | DynaJS-A |
|---|---:|---:|
| 크롤 성공 | 30/33 | 25/33 |
| potential 흐름 합 | 18 (9쪽) | 5 (4쪽) |
| 계측 실패(스크립트) | — | 1,356 (거의 전부 ES 모듈) |

- **계측 실패 원인 = ES 모듈**: `import`/`export`/`import.meta`가 있는 파일을 classic script로 계측해 파싱 실패
  (068·069 각 540, 088 177). 프록시는 응답이 모듈로 로드되는지 모르므로, 계측 서버가 모듈 문법 파싱 오류 시
  모듈로 재계측하도록 고침(`instrument-server.mjs`, 로그에 `module: true`). 실패 시 원본 코드가 그대로 나갔으므로
  이 페이지들은 **분석 없이** 실행된 것 → potential이 적었던 한 원인.
- **크롤 실패**는 전부 "Chrome reached hard timeout"(replay에서 DOMContentLoaded 미발생, Passive에서 본 것과 동일).
  두 도구 모두에서 일어나고 일관되지 않음(052: Jalangi 실패·DynaJS 성공) → replay 불안정성으로 보임.
- 재실행: DynaJS 33쪽 전체(`results/dynajs-mod/`), Jalangi 실패 3쪽(`results/jalangi-retry/`).
- potential 차이는 계측 실행 중 숫자라 비교용이 아님(A는 `Ev`로 새로 만든 코드에서 taint를 잃음). 비교는
  각 모드가 만든 DSE URL을 **비계측** Passive로 재방문해 확인된 흐름으로 함(`dse-urls/<mode>/<id>.txt`).
- **LOC** (빈 줄·주석 제외): PSE 4,434 (손 모델 2,295, Jalangi 어댑터 873) / 안 A: PSE 대비 diff 180줄 /
  안 B(FlowAnalysis판): 228줄 = Sym 전이 함수(concolic에서 옮김) + SWIPE 접착부 + PSE fallback 표(case-map 4개).
  재사용(SWIPE용으로 쓴 코드 아님): `analyses/flow` 1,744줄, `sym.ts`+`smt.ts` 740줄, 자동 생성 명세 모델
  176파일 3,584줄. PSE 손 모델 2,295줄과 대비되는 축은 "손으로 쓴 내장 모델 0줄 + fallback 4개".

## 2. SWIPE DSE 구조 (Jalangi판)

```
Chromium(taint) ── mitmproxy(proxy.py, WARC replay) ── Babel(ES5) → Jalangi2 esnstrument ── 페이지에 J$ 런타임+PSE 주입
     │ 페이지 안 PSE 분석: location.{href,search,hash}/cookie/referrer를 심볼로, 내장 함수는 손 모델로 처리
     └─ XHR POST https://localhost:8307  {type:'constraint', body:{type:'page_init'|'Found XSS'|...}}
          → srv/main.py(FastAPI) → scripts/swipe/src/constraint/*.py → Z3 → 새 URL → 다시 방문 (max_dse_attempts)
```

분석 코드(`analyses/primitive-symbolic-execution`, 테스트 제외 88파일, 코드 4,434줄):

| 부분 | 줄 수 | 포팅 시 |
|---|---:|---|
| Jalangi 어댑터 (`hook.ts` 575 + `jalangi2.ts` 297) | 872 | DynaJS 콜백으로 교체 |
| 내장 함수 손 모델 (`pse/models` 38 + `pse/symbols` 30 파일) | 2,295 | 안 A: 그대로 / 안 B: DynaJS atomic-op 모델로 대체 |
| 나머지 (심볼, SMT 인코딩, 원격 로그, 유틸) | ~1,267 | 그대로 |

## 3. 콜백 대응표

| Jalangi2 (PSE 사용) | DynaJS | 차이 |
|---|---|---|
| `invokeFunPre/invokeFun(iid,f,base,args,isCtor,isMethod,functionIid,functionSid)` | 같은 이름, `functionIid` 없음 | native 판정을 따로 해야 함 (계측 표시 or `Function.prototype.toString`에 `[native code]`) |
| `getFieldPre/getField(iid,base,offset,isComputed,isOpAssign,isMethodCall)` | `(id,base,prop,isPrivate)` | 플래그 미사용이라 무관 |
| `putFieldPre/putField` | 동일 구조 | 〃 |
| `binaryPre/binary(…,isOpAssign,isSwitchCaseComparison,isComputed)` | `(id,op,left,right[,result])` | 〃 |
| `unaryPre/unary` | 동일 | — |
| `conditional(iid,result)` | `condition(id,op,value)` | `op`로 if/&&/\|\|/?: 구분 가능 (Jalangi보다 정보 많음) |
| `scriptEnter/Exit`, `functionEnter/Exit` | `scriptEnter`, `functionEnter` 등 | PSE에선 빈 구현 |
| `J$.util.callUnary/callBinary/callFun` | 없음 | 어댑터에 직접 구현 (~30줄) |

## 4. 포팅 작업 목록

1. **런타임 번들** — `build-browser.mjs` (완료, `dist/dynajs-runtime.js`).
2. **계측기 CLI 정리** — `djx instrument`가 브라우저용으로 쓰기엔 부족한 점:
   - 파일마다 id가 0부터 시작하고 `D$.ids = Object.assign(...)` → 한 페이지에 스크립트가 여럿이면 위치 정보가 덮어써짐.
     파일별 id offset(또는 파일 id 접두) 필요.
   - 출력에 로컬 절대경로가 들어감 → 원래 URL을 파일명으로 넘길 옵션 필요.
   - classic script vs module 구분(`isScript`, issue #5) — 페이지 스크립트는 classic이어야 전역 `var`/함수 선언이 유지됨.
     spike에선 함수 선언이 `try{}` 블록 안에 들어가도 Annex B로 전역에 잡혀 인라인 핸들러(`onmousewheel`)가 동작했음.
3. **proxy.py 교체** — `sj.execute(INSTRUMENTATION_SCRIPT …)` 자리에 `node dist/bin/djx.js instrument`(또는 상주 프로세스),
   Babel 단계 끄기, HTML 머리에 `dynajs-runtime.js` + 분석 스크립트 주입, 인라인 이벤트 핸들러 속성 계측.
   `executor.py:filter_coverage`의 Jalangi 문자열 필터도 DynaJS용으로.
4. **분석 포팅** — 안 A 또는 안 B (아래).
5. **실행** — a5(Ryzen 9 7950X, Docker)에서 SWIPE 이미지 위에 DynaJS판을 얹어 Jalangi판과 같은 WARC로 비교.

### 안 A: 어댑터만 교체 (빠름)
`hook.ts`의 `HookAnalysis`를 DynaJS 콜백으로 다시 쓰고 나머지 PSE는 그대로. 메시지 포맷이 같으니 Python 쪽 수정 없음.
지표 중 "XSS 수 / 계측 실패 / 시간·메모리"는 이걸로 나옴. "분석 코드 줄 수" 비교는 어댑터 872줄 → DynaJS판 몇 줄 정도로만 보임.

### 안 B: DynaJS 내장 모델 활용 (논문 메시지에 맞음)
문자열 내장 함수 손 모델 2,295줄을 DynaJS의 atomic-op 훅 + 기존 concolic(`analyses/concolic/src/{sym,smt}.ts`)으로 대체하고,
SWIPE에서 가져올 건 소스(location/cookie/referrer)·싱크·원격 로그뿐. 제약을 SWIPE Python 쪽이 읽는 포맷으로 내보내는 변환이 추가로 필요.
줄 수 비교가 의미 있어지지만 작업량이 큼.

권장: 마감(11-17) 감안해 **안 A로 파이프라인부터 돌려 지표를 확보**, 남는 시간에 안 B 일부(예: split/indexOf/substring 계열)만.

## 5. 고정할 지표 (이슈 #12)

- 발견한 XSS 수 (`Found XSS` 메시지, SWIPE처럼 비계측 페이지에서 재확인)
- 계측 실패 수 (스크립트 단위: 파싱/계측 에러, 계측본 런타임 에러) — Jalangi판은 Babel 실패 + esnstrument 실패
- 페이지별 시간, peak memory (Chromium 렌더러 프로세스)
- 포팅에 든 분석 코드 줄 수 (Jalangi판 vs DynaJS판, 위 표 기준으로 같은 방식으로 셈)

## 6. 대상 데이터

`../../../swipe-dataset/` (João 녹화 WARC). WARC 있는 디렉터리 39개, store까지 있는 건 13개.
라벨 없음 → Jalangi판 SWIPE DSE를 같은 WARC로 우리가 직접 돌려 기준선으로 씀.

## 7. 파일

- `build-browser.mjs`, `browser-entry.ts`, `shims/` — 런타임 브라우저 번들
- `spike/` — example_page 계측 확인용 (`python3 -m http.server -d bench/swipe` 후 `/spike/test.html?mustcontainthisstring`)

## 1.5 왜 DynaJS-core의 potential이 Jalangi보다 적은가 (2026-11-12 분석)

potential 흐름은 분석이 아니라 SWIPE의 taint Chromium이 낸 것(URL 소스가 *디코딩된* 채로 HTML/JS 싱크에 도달).
SWIPE의 고유 키(iframe 도메인 + 스택 최상단 스크립트 + 줄:열)로 다시 세어 출처를 분류함
(`/tmp/classify.py`, `peek.py` — results의 zlib JSON `taint_logs`):

| | 흐름 | 계측기 자체가 만든 것 | 페이지 흐름 |
|---|---:|---:|---:|
| Jalangi | 17 | 15 | 2 (131) |
| DynaJS-core 1차 | 4 | 2 | 2 (068, 069) |
| DynaJS-core 재실행(모듈 수정) | 3 | 3 | 0 |

- **계측기 자체 흐름**: Jalangi 런타임의 `callAsNativeConstructorWithEval`이 `new Constructor(args[0],…,args[n])`을
  만들어 eval → n의 숫자에 URL taint가 붙어 "URL→eval" 흐름으로 잡힘. 줄 10096/228은 Jalangi 헤더 위치라
  criteo·googleapis 등 서로 다른 사이트에서 같은 줄로 반복됨. 122의 것도 Jalangi 계측 코드
  (`jalangiinstrumentation.R(...)`)의 eval. DynaJS도 같은 종류가 있음(065: 브라우저 안에서 계측된 `D$.D(...)` 코드의 eval).
- **진짜 페이지 흐름은 계측이 안 된 스크립트에서만 보임**: 131의 2건은 Jalangi가 계측에 실패한 `truereachAdRender.js`
  (스택에 Jalangi 프레임 없음, 원본 줄 2), 068/069의 2건은 DynaJS 1차에서 모듈이라 계측 실패한 스크립트. 같은 스크립트를
  계측하면 PSE가 값을 기호로 들고 다니다 자기 모델로 구체화한 문자열을 씀(예: `innerHTML`은 PSE `setField` 모델이 직접
  씀) → Chromium의 "디코딩됨" 표시가 사라져(`NO_ENCODING`) SWIPE 필터에서 탈락.
- **131 조기 종료**: DynaJS-core는 `truereachAdRender.js`를 계측했기 때문에 PSE의 `setField` 모델이 기호 값의
  `innerHTML` 쓰기를 보고 `Found XSS` → SWIPE가 그 사이트를 "찾음"으로 처리하고 DSE 큐(Jalangi와 같은 4개 URL)를 버림
  (방문 1회, 1.8 s). 즉 131은 DynaJS가 *분석으로* 싱크를 잡은 경우이고, Jalangi는 계측 실패로 분석이 못 봤음.
- 결론: 계측된 실행 중의 potential 수는 두 도구 모두 대부분 계측기 부산물이라 비교 지표로 못 씀. SWIPE 방법론대로
  DSE가 만든 URL을 **비계측**으로 재방문해 확인된 흐름으로 비교해야 함. 크롤 실패(094/132/154 반복)는 별개 문제.

## 1.6 채점·속도 개선 (2026-11-12)

- **확인 재실행**(`dataset/confirm-all.sh <mode>`): 각 모드의 DSE가 만든 URL(`results/dse-urls/<mode>/<id>.txt`)을
  Passive(`try-alternative-paths=false` → SWIPE가 비계측 프록시로 Chrome을 돌리고 DSE 안 함)로 다시 방문 →
  `results/passive-of-<mode>/`. 여기의 potential이 비교 지표(계측기 부산물 없음). 예산 3600 s는 URL 전부 1회 방문용.
- **분석이 직접 찾은 싱크**: `summarize.py`에 `sink_hit` 열(SWIPE의 "Sink was hit" = 분석의 `Found XSS`, 그 사이트 DSE 종료).
- **DynaJS 계측 캐시**: SWIPE 프록시는 Jalangi 결과를 host + MD5로 디스크 캐시함(`useCache` 기본 on). DynaJS 계측 서버도
  내용 SHA-256으로 메모리 캐시(컨테이너 = 한 페이지 실행 동안 유지, Jalangi 캐시와 같은 범위). 로그에 `cached: true`.
- **partial mode**: 계측 서버 `--hooks cb1,...`(`proxy/hint.mjs`). `run-swipe.sh`가 분석별 콜백 목록을 넘김 —
  브라우저에서 `D$.analysis`가 실제로 구현한 콜백을 읽은 것(A 11개, B 16개) + `instrumentCodePre/instrumentCode`
  (Jalangi는 eval 코드를 항상 계측하므로 맞춤). `DYNAJS_HOOKS=full`이면 전체. 마이크로 테스트 결과는 full과 동일,
  계측 코드 크기는 약 1/3(simpleDOMXSS1 script1.js 2,580 → 815 B).
- 실행(a5, 11-12 20:30~): ① Jalangi·DynaJS-core 기존 URL 확인 재실행(각 3병렬) ② Jalangi(`-r2`)와 DynaJS-core
  partial+캐시(`-partial`)를 번갈아 6병렬 — 같은 부하에서 시간 비교 ③ DynaJS-flow(`-taint`) 131·068: 실제 페이지 흐름이
  디코딩 표시를 유지한 채 싱크에 닿는지(흔적 보존) 확인.

### 흔적 보존 확인 결과 (DynaJS-flow, 131·068)
- **131**: 같은 googletag `page_url` 흐름이 DynaJS-flow에서는 `URL_COMPONENT_DECODED`로 싱크에 닿음 → SWIPE가 potential 1로 셈.
  DynaJS-core(PSE)에선 같은 흐름이 `NO_ENCODING`이라 탈락했음. 즉 "원래 값은 그대로, 기호 정보는 옆에" 구조가
  브라우저 taint를 보존함 — 확인. (이번 131 실행은 첫 방문에서 hard timeout으로 크롤 실패 처리, 방문 1회.)
- **068**: DynaJS-core 1차(모듈 계측 실패 → 원본 실행)에서만 보였던 흐름이, 모듈을 계측한 DynaJS-core 재실행과
  DynaJS-flow 모두에서 **싱크 자체가 안 일어남**(NO_ENCODING으로도 없음). Jalangi도 0. 원인 미확정 — 계측된 ES 모듈의
  동작 차이(투명성 문제)인지, 이 페이지 설정(실험/리비전 값)이 실행마다 달라서인지. 로그엔 JS 오류 없음.
- B 싱크에 PSE `setField` 모델의 `innerHTML` 쓰기 보고를 추가(131에서 DynaJS-core가 `Found XSS`를 낸 그 경로).

### DynaJS-flow(FlowAnalysis판) example_page 파이프라인 결과 (a5, 11-12)
- 4번째 방문(시작 후 413 s)에 `?mustcontainthisstring#…` 생성 → `vulnerable_dse` HTML 싱크 흐름(`URL_COMPONENT_DECODED`)
  도달. 이전 B(ConcolicAnalysis 상속)는 5번째 방문/약 680 s, PSE/Jalangi는 2번째 방문/279 s.
- `vulnerable_passive`(eval) 흐름도 잡힘: 계측된 eval 코드에 URL taint가 디코딩 표시와 함께 남음. DynaJS-core에선
  이 흐름을 잃었음 — 흔적 보존 차이와 같은 이유.
- 이후 언롤된 위치별 제약을 계속 부정하며 시간 한도까지 52번 방문(7,063 s). Unique potential 4.

### 공정 비교 (a5, 11-13): 생성 URL 재검증 + partial mode/캐시
- 채점: 각 도구가 만든 URL 목록을 계측 없는 passive 크롤로 다시 방문해 잠재 흐름을 셈 (`confirm-all.sh`).
  - passive-of-jalangi: 3 흐름 / 2쪽 (028, 131). passive-of-dynajs-mod: 3 흐름 / 2쪽 (028, 131). 동점.
  - 131의 흐름은 시작 URL 자체에서 나옴 (DSE가 만든 URL 불필요). 데이터셋에서 DSE로만 찾은 흐름은 두 도구 모두 0.
- 속도 (jalangi-r2 vs dynajs-partial, 33쪽): 크롤 성공 30/30, 방문 108/146, 평균 587/686 s (방문당 179/155 s),
  메모리 중앙값 2,588/1,551 MB. DynaJS 계측 2,671건 + 캐시 적중 7,047건, 실패 4.
  - partial mode 전(dynajs-mod): 크롤 성공 26, 메모리 중앙값 2,050 MB.

### DynaJS-flow 33쪽 실행 (a5, 11-13)
- 크롤 성공 15/33. 실패 18쪽은 모두 첫 방문에서 Chrome hard timeout(`browser_timeout` 140 s). 계측 자체는 빠름(010: 15개 2 MB, 2.1 s), 계측 실패 3.
  → 실행 중 FlowAnalysis 런타임 비용(또는 멈춤)으로 페이지 로드가 140 s 안에 안 끝남. 원인 미확인.
- 재검증(passive-of-dynajs-b): 4 흐름 / 2쪽 (028:1, 131:3). Jalangi·DynaJS-core는 3 흐름 / 2쪽 (같은 쪽).
  131에서 한 개 더 잡힌 건 criteo iframe 흐름이 `URL_DECODED`로 기록된 것(다른 두 도구에선 `NO_ENCODING`).
- 방문 102, 평균 459 s, 메모리 중앙값 1,702 MB, 계측 1,963 + 캐시 3,394.

### DynaJS-flow 크롤 실패 원인 (11-13)
- 010: escape 단계가 네이티브 호출마다 인자 객체 전체를 깊게 순회 → lz-string `hasOwnProperty.call(dict, k)`가 2차 시간. 수정(dynajs 470dc43) 후 140 s 안에 성공.
- 같은 날 `String.fromCharCode` 모델 버그(97 → "97")도 발견, ESMeta 생성기에서 수정(dynajs 8bc5c76).
- 나머지 17쪽, 수정 + 페이지 로드 한도 900 s:
  - 성공 6 (056, 065, 080, 088, 094, 122): 그냥 느림.
  - 900 s까지 훅 이벤트가 계속 나오지만 미완료 5 (037, 052, 123, 131, 154): 더 느림.
  - 어느 시점 뒤로 훅 이벤트가 끊김 5 (020 @34 s, 035 @112 s, 036 @320 s, 098 @427 s, 142 @133 s): 훅 밖(스펙 모델 내부 루프나 escape 등 분석 코드, 또는 네이티브)에서 멈춤. 원인 미확인.
- 조용해진 5쪽 재추적(스펙 모델·escape 내부까지 tick): 멈춘 게 아니라 훅 없는 모델 안에서 바쁨.
  020 `Array.prototype.shift` 모델(원소를 하나씩 이동), 142 문자열 속성 읽기마다 `CanonicalNumericIndexString` 모델.
  수정(미커밋): 정보 없는 키의 문자열 인덱스 판정을 네이티브로, 진짜 배열의 shift/unshift를 네이티브로.
- 세 수정 모두 적용, 원래 한도 140 s로 실패 18쪽 재실행: 010, 088, 142 성공(3/18). 나머지 15쪽은 여전히 시간 초과.
  → 고칠 수 있는 병목은 일부, 대부분은 FlowAnalysis 기본 비용(모든 값 래핑 + 내장 함수 모델 실행).

## fallback 제거 ablation 결과 (2026-11-16, 새 FlowAnalysis 구현: transparentCalls·length 훅 반영)

같은 코드로 fallback 있음(`dynajs-b-new`)/없음(`dynajs-b-newnofb`)을 33페이지에 번갈아 6병렬 실행
(page load 140 s, DSE budget 900 s), 이어 생성 URL을 계측 없이 재방문(`passive-of-*`).

| | crawl_ok | visits | mean s | median mem | 재방문 potential |
|---|---|---|---|---|---|
| fallback 있음 | 17/33 | 107 | 481 | 2.08 GB | 4 flows / 3 pages (028:1, 131:2, 142:1) |
| fallback 없음 | 16/33 | 99 | 449 | 1.71 GB | 4 flows / 3 pages (028:1, 131:2, 142:1) |

- 찾는 흐름은 동일. 142의 1건은 시드 URL 재방문에서 나온 DoubleVerify 광고 iframe 흐름으로, 이전
  재방문(Jalangi·DynaJS-core·이전 DynaJS-flow)에선 안 나옴 → 도구가 아니라 재방문 비결정성. 이를 빼면 3 flows/2 pages로
  Jalangi·DynaJS-core와 같음.
- 차이는 방문 수뿐: 010·026·096·120·132에서 fallback 없을 때 1회씩 적고, 126은 fallback 없을 때 크롤 실패(140 s 초과).
  fallback 발동 횟수는 결과에 기록되지 않아 방문 차이가 fallback 때문인지 실행 간 변동인지는 구분 못 함.
- 이전 DynaJS-flow 실행(15/33) 대비 crawl 17/33.

## 크롤 실패 원인 재조사 + coverage off 재실행 (2026-11-17 새벽)

### 원인: SWIPE의 JS coverage 수집
- 실패 쪽 로그는 대부분 `Done waiting!` 다음에 `Chrome reached hard timeout`: 페이지는 로드됐는데,
  그 뒤 `page.coverage.stopJSCoverage()`(precise block coverage, 메인 스레드 필요)와 `browser.close`가
  방문 프로세스 join 한도(140 + 15 + 5 = 160 s)를 넘김 → 크롤 실패로 집계.
- coverage는 `coverage_used/total` 통계에만 쓰이고 DSE에는 쓰이지 않음 → `track_coverage=false`로 끄는 게 공정.
- 합성 페이지(로컬)에서 block coverage를 켜면 PSE 270 → 1324 ms, FlowAnalysis 696 → 6648 ms: 계측 코드가 많을수록 비용이 커져
  DynaJS-flow가 가장 크게 손해.

### DynaJS 쪽 수정 (작게, 미커밋)
- `analyses/flow/internal/lift.ts`: `liftBottomPrimitives` 플래그(기본 true). 끄면 정보 없는 원시값은 래핑하지 않음
  (ProxiedPrimitive + WeakMap 2건 절약). SwipeDSE는 정보를 만들 때만 붙이므로 false.
- `analyses/flow/flow.ts`: 선택 훅 `skipModel(f, entries)`. SwipeDSE는 인자가 정보 없는 원시값/원시값만 든 진짜 배열(≤4096)이면
  모델 대신 네이티브 실행(`[10,13,32].includes(c)` 같은 핫스팟).
- 합성 페이지: 9033 ms → 566 ms (16×). PSE-core 231–270 ms, 네이티브 6.8 ms.
- 검증: taint 44/44, concolic 기존과 같은 3건 실패(로컬 z3 환경), SWIPE 마이크로 테스트 24개 출력 동일.
- 번들: `dse-dynajs-lfsk.js` (= 위 두 수정 적용한 `dist/dse-dynajs.js`).

### 실험 경과 (실패 16쪽, 140 s)
| 변형 | 성공 |
|---|---|
| lift 수정만 | 056, 088 |
| lift + nomodel | 056, 122 |
| lift + skipModel (lfsk) | 056, 088 |
| lfsk + coverage off (lfskncov) | 020, 037, 052, 056, 065, 088, 098, 122, 131, 142 (10/16) |
- nomodel(모델 전부 끔)/shallow 실험도 020·035·036은 못 살림 → 모델이 아니라 래핑/훅 기본 비용.
- 남은 6쪽(035, 036, 080, 094, 123, 154)은 load 자체가 140 s 안에 안 끝남. 핫스팟:
  154 Proxy ownKeys `t.includes(e)||t.push(e)`, 123 gtag `querySelectorAll('*')` 순회 + `indexOf`,
  035 CSS 속성 fingerprinting(filter/map 안의 includes). 남은 프로필 비용: concatList의 원소별 defineProperty(7.5%),
  invokeFunPre의 Array.from(6.7%) — DynaJS 수정 최소화를 위해 손대지 않음.

### 세 도구 모두 coverage off로 재실행 (a5, 12병렬, 페이지별 번갈아)
`EXTRA_JQ='."track_coverage"=false'`, page load 140 s, DSE budget 900 s. 결과 `results/{dynajs-b,jalangi,dynajs-partial}-ncov`.

| | crawl_ok | visits | mean s | median mem | 계측 중 potential |
|---|---|---|---|---|---|
| Jalangi (`jalangi-ncov`) | 33/33 | 114 | 597 | 2.34 GB | 13 / 6쪽 |
| DynaJS-core (`dynajs-partial-ncov`) | 30/33 | 150 | 706 | 1.43 GB | 0 |
| DynaJS-flow lfsk (`dynajs-b-ncov`) | 26/33 | 142 | 630 | 2.03 GB | 5 / 3쪽 |
- DynaJS-flow 실패: 035, 036, 080, 094, 123, 154 + 096(이전 실행들에선 성공 → 부하에 따른 경계값).
- DynaJS-core 실패: 020, 094, 132. Jalangi는 coverage off로 이전 30 → 33.

#### 재방문(계측 없음, coverage off) 결과 — 공정 점수
| | 재방문 potential | 쪽별 |
|---|---|---|
| Jalangi | 3 / 2쪽 | 028:1, 131:2 |
| DynaJS-core | 3 / 2쪽 | 028:1, 131:2 |
| DynaJS-flow lfsk | 6 / 4쪽 | 028:1, 098:1, 131:3, 142:1 |
- URL별 단독 재방문(`results/passive-single-*`)과 3회 반복(`results/passive-rep-*`)으로 추가 흐름 귀속:
  - 098:1은 DynaJS-flow만 생성한 DSE URL `search??#`에서 나옴. `??#` 3/3회 재현, 시드 URL 0/3회 → DSE가 기여한 유일한 흐름.
    GTM `JAVASCRIPT` 싱크에 URL 한 글자(58–59)만 들어가 악용 가능성은 낮음.
  - 131의 세 번째는 `search#&`에서 1회 나온 Criteo 광고 sync iframe 흐름. 반복 0/3회 → 비결정성으로 제외.
  - 142:1은 시드 URL(모든 도구가 방문)의 DoubleVerify 광고 iframe 흐름. 반복 1/3회 → 비결정성으로 제외.
  - 정리: DynaJS-flow 4 flows / 3쪽 (028:1, 098:1, 131:2), Jalangi·DynaJS-core 3 / 2쪽.
- 096 단독 재시도 미실행.

#### fallback 없음, coverage off (`dynajs-b-ncovnofb`, `dse-dynajs-lfsknofb.js`)
- crawl 27/33, 148 visits, 145 s/visit, median mem 2.01 GB. 실패 6쪽(035, 036, 080, 094, 123, 154); 096은 이번엔 성공(경계값).
- 재방문: 4 flows / 3쪽 (028:1, 131:2, 142:1) → 142 제외 시 3 / 2쪽. `??#` URL도 생성했지만 이 재방문에서는 098 흐름이 안 나옴
  (`??#` 재방문 누적 5/6회 재현).
- 논문 반영: tables/swipe.tex, figures/swipe.tex(gen-fig.py), swipe.tex. LOC 338(= 319 + skipModel 16 + 상수 3).
