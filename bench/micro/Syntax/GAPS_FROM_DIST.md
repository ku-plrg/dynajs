# Syntax bench gap analysis — `bench/micro/Syntax` vs `bench/dist/nodemedic-expose/Syntax`

날짜: 2026-06-19. 기준(reference) = `bench/dist/nodemedic-expose/Syntax` (ExpoSE+NodeMedic port, 86 files).
대상(authored) = `bench/micro/Syntax`. 아래 경로는 각 트리 루트 기준 상대경로.

## 요약
- **Feature 단위 누락 없음.** micro가 dist의 모든 feature dir을 포함한다(이름만 다름).
  - `compound-assign`(dist) = `compound-assignment`(micro)
  - `ternary`(dist) = `conditional`(micro)
  - `regexp-unicode-property-escapes`(dist) = `regexp-unicode-codepoint`(micro)
- 실제 누락은 **시나리오 단위**이며, 대부분 **객체/프로토타입 taint 전파** 영역(micro가 얕게 다룸).
- 단, GAP 다수는 순수 "구문"보다 **객체 taint 의미론**(whole-object / defineProperty / boxing 등)에 가깝다 — 포팅 여부는 판단 필요.

---

## GAP — micro에 없는 시나리오 (포팅 후보)

### 1. 객체/생성자 taint 전파 → micro `Objects/new-constructor`
| dist 파일 | 테스트하는 시나리오 |
|---|---|
| `Objects/new-constructor/taint_constructor.js` | 생성자→중첩 필드(`this.name={first}`), 프로토타입 메서드(`greeting()`), `Person.call(this,…)`+`Object.create(Person.prototype)` 상속을 통한 taint; clean 형제 필드는 clean 유지 |
| `Objects/new-constructor/taint_object_inherit.js` | tainted 속성을 clean 객체 필드로 복사(`r.a=e.a`) → 그 필드만 taint, 컨테이너는 clean |
| `Objects/new-constructor/taint_object_whole.js` | `__set_taint__`를 객체 전체(`Object()`)에 → 객체 자체가 tainted (속성 아닌 객체-식별 taint) |
| `Objects/new-constructor/taint_string_inherit_char.js` | tainted 문자열의 char를 인덱스로 읽어(`z[1]`) 객체 필드에 대입 → char-level taint 전파 |
| `Objects/new-constructor/taint_string_prop_propagation.js` | concat 결과 tainted 문자열을 `q.a`에 저장 후 per-index char taint(`q.a[0]` taint, `q.a[5]` clean), 컨테이너는 clean |

### 2. 객체 리터럴 중첩/전체 taint → micro `Literals/object-literal`
| dist 파일 | 시나리오 |
|---|---|
| `Literals/object-literal/taint_object_nesting.js` | 다단계 중첩 리터럴에서 taint가 **아래로만** 전파(위로 X); 내부만 taint면 컨테이너 clean |
| `Literals/object-literal/taint_object_prop_object.js` | 객체-값 속성: 객체 전체 taint vs 한 속성 taint 구분 (`__set_taint__(x.test)` → 컨테이너도 taint) |
| `Literals/object-literal/taint_object_prop_primitive.js` | 위와 동일한 전체-vs-속성 구분 (primitive 값 속성) |

### 3. 멤버 접근 store/별칭 → micro `Operators/member-access`
| dist 파일 | 시나리오 |
|---|---|
| `Operators/member-access/taint_putfield.js` | 체인 대입(`a = b.styles = k`)이 `b.styles`와 `a` 모두에 taint 전파; 별칭/공유참조 taint |
| `Operators/member-access/taint_prop_map.js` | `Object.defineProperty`로 속성 추가 시 taint 상호작용 |

### 4. 기타
| dist 파일 | micro feature | 시나리오 |
|---|---|---|
| `Operators/string-concatenation/taint_invariant_all_chars.js` | `Operators/string-concatenation` | **양쪽 피연산자 모두 tainted**일 때 각 결과 char가 출처 피연산자를 추적 (micro는 한쪽만 taint) |
| `Operators/nullish/taint_undefined_null_add.js` | `Operators/nullish` 또는 `arithmetic` | `undefined`/`null`에 taint 후 `+` 강제변환에서 taint 생존 |
| `Functions/closure/taint_callback_map.js` (부분) | `Functions/closure` | `Array.map` 요소별 taint 보존 + `toString()`/`Object.isFrozen()`이 taint 지우는 측면 (core callback-taint는 이미 커버됨) |

---

## SKIP — 포팅 불필요 (ExpoSE/NodeMedic 인프라·솔버 플러밍, 구문 동작 아님)

| dist 파일 | 사유 |
|---|---|
| `ControlFlow/if-else/concolic_spaced_name.js` | "spaced name" 하네스 아티팩트; 본문은 평범한 truthiness if (이미 커버) |
| `ControlFlow/if-else/concolic_test_columns.js` | "test columns" 하네스; `if(x) assert(!(!x))` 중복 |
| `ControlFlow/if-else/concolic_sample_coverage.js` | "sample coverage" 하네스; 중복 then/else |
| `Operators/equality/concolic_rename.js`, `concolic_rename_simple.js` | 솔버 변수 renaming 플러밍 |
| `Operators/equality/concolic_two_symbols.js` | raw 2-심볼 concolic 플러밍 |
| `Operators/arithmetic/concolic_infoflow.js` | non-interference/정보흐름 보안속성 하네스 |
| `Objects/new-constructor/concolic_object_boxing.js` | `Object(x)` boxing-식별 플러밍 (micro에 boxing 모델 없음) |
| `Operators/arithmetic/concolic_object_pure_add.js` | symbolic-array 강제변환 엣지 플러밍 |
| `Functions/closure/concolic_lamda.js` | 고차함수 `x()()` concolic 플러밍 엣지 |

---

## COVERED
위 GAP/SKIP를 제외한 dist 파일(~60개)은 micro가 동등 시나리오로 이미 커버함 (relational/equality/arithmetic/loop/recursion/unary/void/delete/in/ternary/let-const/spread/string-concat L·R·coerce·precise 등). 상세 매핑은 생략.

> 메모: 파일명이 `concolic_settimeout`이어도 본문에 setTimeout/closure가 없는 등 dist의 일부 파일명은 내용과 무관 — 분류는 **본문 동작 기준**으로 했다.
