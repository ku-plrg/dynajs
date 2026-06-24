# Syntax taint 벤치마크 분석 (dynajs vs nodemedic)

실행: `node bench/run-micro-benchmark.mjs --dir Syntax --reps 1 --warmup 0`
대상: `taint` 타입 벤치마크만. `[n]`은 한 파일 안의 입력 변형 인덱스.

> **상태: A(중복 제거) + B(모순 라벨 통일) 적용 완료** — 아래 수치는 모두 *B 적용 후* 기준. 변경 내역은 §0 참조.

## 0. 적용된 변경

### A — 중복 제거 + @target 정규화 [완료]
1. **순수중복 `_2` 26개 삭제** (base와 코드·라벨 100% 동일, `@target` 주석만 달랐음). scratchpad에 백업.
2. **`@target`을 es5/es6+ 2버킷으로 정규화** (es3→es5, es2016/18/20/22→es6+). 점수에는 무관(리포트 그룹핑 전용)하며 참조 dist와 동일 컨벤션.
3. 파일 수 124 → 98.

### B — 모순 라벨 5쌍 통일 [완료]
참조 `bench/dist/nodemedic-expose/Syntax` 기준 원칙: **불리언 collapse(`===`,`==`,`!=`,`<`,`>=`,`instanceof`,`!`,`typeof`) → untaint(false)**; **데이터 운반(`&&`/`||` 피연산자 통과, `+`/`-`/`~`) → taint(true)**.
- `equality`, `logical`, `relational`, `unary`: base 라벨이 이미 정확 → 잘못된 `_2`(불리언 결과를 true로 라벨) 삭제.
- `instanceof`: **base가 틀림**(`instanceof`결과를 true로) → base를 false로 수정, `_2`(정확) 삭제.
- 결과: 파일 98 → **93**, 모순 0쌍. 백업: scratchpad/syntax_backup_B.

> 라벨이 정직해지면서, 엔진이 불리언 결과를 taint 처리하는 진짜 버그가 공통 FP 9건(§3)으로 드러남 → **C(엔진 수정)** 대상.

남은 작업: **C** (엔진 불리언-결과 over-taint 수정) + dynajs 전용 FP 7건/FN 5건(§2,§4).

## 1. 전체 집계 (taint, A+B+누락보강 적용 후)

| 엔진 | TP | TN | FP | FN |
|------|----|----|----|----|
| **dynajs** | 98 | 65 | **21** | **9** |
| **nodemedic** | 84 | 68 | 11 | 23 |

dynajs가 TP↑·FN↓ 이지만 FP는 더 많음(21 vs 11). FP 증가분은 새로 추가한 string-concat 벤치가 노출한 실제 over-taint(§7-findings).

## 2. dynajs가 nodemedic보다 더 내는 FP (7건)

dynajs=FP 인데 nodemedic은 FP 아님(주로 TN). dynajs 과대오염(over-taint).

| 벤치마크 | nodemedic |
|----------|-----------|
| `Classes/new-target/taint_new_target[0]` | TN |
| `Functions/arrow-function/taint_arrow_function[1]` | TN |
| `Functions/default-parameters/taint_default_parameters[1]` | TN |
| `Functions/iife/taint_iife[1]` | TN |
| `Objects/new-constructor/taint_new_constructor[1]` | TN |
| `Operators/void/taint_void` | TN |
| `Classes/class-static-methods-private/taint_class_static_methods_private[1]` | (nm은 파일 전체 error→FN) |

## 3. 두 엔진 공통 FP (9건) — ★엔진의 불리언-결과 over-taint (C 대상)

라벨은 이제 모두 정확(불리언 collapse=untaint). 두 엔진 모두 이 결과를 taint로 처리해서 FP 발생 = 실제 엔진 버그.

| 벤치마크 | 식 |
|----------|-----|
| `Operators/equality/taint_equality[0]`, `[1]`, `[2]` | `x===5`, `x=="a"`, `x!==9` |
| `Operators/instanceof/taint_instanceof[0]` | `o instanceof C` |
| `Operators/logical/taint_logical[3]` | `!x` |
| `Operators/relational/taint_relational[0]`, `[1]` | `x<10`, `x>=3` |
| `Operators/unary/taint_unary[2]`, `[3]` | `!x`, `typeof x` |

nodemedic만 FP인 케이스: **0건**.

## 4. dynajs FN 목록 (11건)

| 벤치마크 | nodemedic |
|----------|-----------|
| `Classes/class-fields-private-in/taint_class_fields_private_in` | FN (공통) |
| `Classes/class-fields-private/taint_class_fields_private` | FN (공통) |
| `ControlFlow/for-await-of/taint_for_await_of` | FN (공통) |
| `Literals/bigint/taint_bigint` | FN (공통) |
| `Operators/logical/taint_logical[0]` | FN (공통) |
| `Operators/logical/taint_logical_2[0]` | FN (공통) |
| `ControlFlow/for-of/taint_for_of_string` | **TP** ← dynajs만 놓침 (async/iter, flaky 의심) |
| `ControlFlow/switch/taint_switch[0]` | **TP** ← dynajs만 놓침 |
| `Literals/computed-property/taint_computed_property[0]` | **TP** ← dynajs만 놓침 |
| `Operators/increment-decrement/taint_increment_decrement[0]` | **TP** ← dynajs만 놓침 |
| `Operators/nullish/taint_nullish[1]` | **TP** ← dynajs만 놓침 |

우선순위(dynajs만 놓침) 5건: for-of-string, switch, computed-property, increment-decrement, nullish.

---

# 5. `_2` 짝(중복) 점검 결과

Syntax 트리의 `X.js` + `X_2.js` 짝 = **32쌍**.

## 5-1. 사실상 중복 (코드 동일, `// @target` 주석만 다름) — 26쌍 ★[삭제 완료]

base의 `@target`은 실제 도입 버전(es3/es2018/es2020/es2022…), `_2`는 전부 `es6+`로만 바뀜. **코드·assert는 100% 동일** → `_2` 삭제, base의 `@target`은 es5/es6+로 정규화. (백업: scratchpad/syntax_backup)

```
Classes/class-fields-public/taint_class_fields_public_2.js
Classes/class-static-block/taint_class_static_block_2.js
ControlFlow/for-await-of/taint_for_await_of_2.js        ← 질문하신 파일 (중복 맞음)
ControlFlow/labeled-statement/taint_labeled_statement_2.js
Exceptions/optional-catch-binding/taint_optional_catch_binding_2.js
Exceptions/try-catch-finally/concolic_try_catch_finally_2.js
Exceptions/try-catch-finally/taint_try_catch_finally_2.js
Functions/async-await/taint_async_await_2.js
Literals/bigint/taint_bigint_2.js
Literals/hashbang/taint_hashbang_2.js
Literals/numeric-separator/concolic_numeric_separator_2.js
Literals/numeric-separator/taint_numeric_separator_2.js
Objects/new-constructor/concolic_new_constructor_2.js
Objects/new-constructor/taint_new_constructor_2.js
Operators/delete/taint_delete_2.js
Operators/exponentiation/concolic_exponentiation_2.js
Operators/exponentiation/taint_exponentiation_2.js
Operators/in-operator/taint_in_operator_2.js
Operators/increment-decrement/concolic_increment_decrement_2.js
Operators/increment-decrement/taint_increment_decrement_2.js
Operators/logical-assignment/concolic_logical_assignment_2.js
Operators/logical-assignment/taint_logical_assignment_2.js
Operators/member-access/concolic_member_access_2.js
Operators/member-access/taint_member_access_2.js
Operators/void/taint_void_2.js
Variables/var-declaration/taint_var_declaration_2.js
```

## 5-2. 실제로 다른 6쌍

### (A) 정상 변형 — 1쌍
- `Classes/class-fields-private/taint_class_fields_private(_2)` : base는 brand-check(`#secret in o`), `_2`는 private 필드 읽기(`getLabel()`). 서로 다른 기능 테스트 → OK.

### (B) ★정답 라벨 모순 — 5쌍 [해소 완료]
같은 식인데 base와 `_2`의 기대 taint가 **정반대**였음. 참조 기준(불리언 collapse=untaint)으로 통일.

| 짝 | (구)base | (구)`_2` | 참조 정답 | 조치 |
|----|----------|----------|-----------|------|
| `Operators/equality` (`x===5`, `x=="a"`, `x!==9`) | `false` ✓ | `true` ✗ | `false` | `_2` 삭제 |
| `Operators/logical` (`!x`) | `false` ✓ | `true` ✗ | `false` | `_2` 삭제 |
| `Operators/relational` (`x<10`, `x>=3`) | `false` ✓ | `true` ✗ | `false` | `_2` 삭제 |
| `Operators/unary` (`!x`) | `false` ✓ | `true` ✗ | `false` | `_2` 삭제 |
| `Operators/instanceof` (`o instanceof C`) | `true` ✗ | `false` ✓ | `false` | **base 수정**+`_2` 삭제 |

참조 근거: `dist/.../unary/taint_unary_not.js`(`!x`→false), `taint_typeof.js`(typeof→false), `taint_unary_arith.js`(`±`/`~`→true), `relational/taint_comparison.js`(`==`→false), `logical/taint_logical_or.js`(`||`→피연산자 taint 통과=true). instanceof는 직접 파일 없으나 불리언 collapse 원칙으로 false.

---

# 6. 액션 아이템

1. ~~중복 26개(5-1) 삭제 + `@target` es5/es6+ 정규화~~ **[A 완료]**
2. ~~모순 5쌍(5-2 B) 정답 라벨 통일 — 참조 기준 불리언 collapse=untaint~~ **[B 완료]**
3. **[C] 엔진 over-taint 수정** (우선순위):
   - 불리언 결과(`===`,`==`,`!=`,`<`,`>=`,`instanceof`,`!`,`typeof`) → 공통 FP 9건.
   - 객체→문자열 강제변환(`s + obj`)의 결과 char taint → dynajs FP 4건(§7-findings).
   - `String.length` taint 전파(숫자여야 함) → 공통 FP 1건.
4. dynajs 전용 FP(2절) — `void`, `new.target`, arrow/default-param/iife clean 변형 + 강제변환(위 C) over-taint 점검.
5. dynajs 전용 FN(4절) — switch, computed-property, increment-decrement, nullish 미탐지 수정.
6. (선택) `String.length` 공통 FP는 엔진 결정사항 — 정책 확정 후 일괄.

---

# 7. 참조(dist/nodemedic-expose/Syntax) 대비 micro 커버리지 누락

폴더(기능) 단위 비교. micro/Syntax는 참조의 **상위집합**(공통 19 + micro 전용 45 vs 참조 전용 4). 참조 전용 4개 중 2개는 이름만 다른 별칭.

## 별칭 (누락 아님 — 개념 존재)
| 참조 | micro 대응 |
|------|-----------|
| `Operators/compound-assign` | `Operators/compound-assignment` |
| `Operators/ternary` | `Operators/conditional` |

## ★실제 누락
1. **`Operators/string-concatenation` (참조 10파일)** — micro에 해당 폴더 없음. micro는 문자열 결합을 `+=`(compound-assignment)와 템플릿리터럴로만 커버하고, 다음이 빠짐:
   - 이항 `+` 결합 좌/우: `taint_concat_plus_left/right` (`tainted + s`, `s + tainted`)
   - 강제변환 결합: `taint_concat_coerce_left/right`
   - **문자 단위 taint 불변식**: `taint_invariant_all_chars / clear_char / single_char`, `taint_string_precise_index` ← dynajs char-level taint 핵심인데 Syntax에 미커버 (가장 중요한 누락)
   - concolic: `concolic_hello_strings_concat / concat2`
2. **`RegExp` 카테고리 전체** — micro에 없음. 참조엔 `RegExp/regexp-unicode-property-escapes/concolic_unicode_codepoint.js` 1개(concolic). 경미.

## 공통 폴더 내 시나리오 누락(경미)
- **clear-on-reassign**: tainted 변수를 clean 리터럴로 재대입 시 untaint (참조 `compound-assign/taint_clear_reassign.js`). micro에 동일 의미 테스트 없음.
- **ternary tainted-condition**: 조건만 tainted이고 선택된 값은 clean → untaint (참조 `ternary/taint_ternary.js` d1). micro `conditional` 커버 여부 확인 필요.

## 7-add. 누락 보강 — 추가 완료 (참조 라벨 기준)
새 파일 (es5/es6+, micro 컨벤션):
- `Operators/string-concatenation/taint_string_concat.js` — 이항 `+` char-level(좌/우 tainted, 둘다 clean)
- `Operators/string-concatenation/taint_string_concat_coerce.js` — 객체 강제변환 결합(좌/우)
- `Operators/string-concatenation/taint_string_concat_precise.js` — 정밀 per-index(중간 char, 재할당 재구성, `.length`)
- `Operators/string-concatenation/concolic_string_concat.js` — concat 길이 추론(concolic)
- `RegExp/regexp-unicode-codepoint/concolic_unicode_codepoint.js` — 참조와 바이트 동일 복사
- `Operators/compound-assignment/taint_clear_reassign.js` — clear-on-reassign
- `Operators/conditional/taint_conditional.js` — tainted-condition→untaint 케이스 추가(edit)

## 7-findings. 새 벤치가 노출한 결과
- ✅ **char-level 이항 `+` 결합**: dynajs `taint_string_concat` 12/12 통과 — char 단위 정밀 정확.
- ✅ **clear-on-reassign / ternary tainted-condition**: dynajs 통과.
- ★ **객체→문자열 강제변환 over-taint (dynajs)**: `taint_string_concat_coerce[3,4,5]` dynajs 전용 FP(+[6] 공통). 객체 toString 강제변환으로 생긴 char를 dynajs가 taint 처리(참조 정답=clean). nodemedic은 대부분 정확.
- ★ **`String.length` over-taint (양 엔진)**: `taint_string_concat_precise[4]` — tainted char 포함 문자열의 `.length`는 clean 숫자여야 하는데 dynajs·nodemedic 모두 taint → 공통 FP.
- ⚠ **regexp 유니코드 concolic**: dynajs FN(풀지 못해 error), nodemedic은 skip — 어려운 concolic 케이스(정상적 한계).

이 결과로 dynajs FP 16→21(+5: 강제변환 4 + length 1), TP 80→98. 새 over-taint 결함은 §6-C(엔진 수정)에 합류.

> 주의: dynajs taint **FN은 실질적으로 9로 안정**. B-run에서 보였던 "10"은 일시적으로 존재하던 `ControlFlow/for-of/taint_for_of_string` 벤치(dynajs under-taint FN)를 포함한 값이며, 해당 소스 파일이 이후 트리에서 사라져 채점 집합에서 빠진 것(개선 아님). 추가한 파일들은 FN을 0개 추가함. 동일 비교를 원하면 `taint_for_of_string.js`(문자열 char 단위 for-of) 복원 필요.
