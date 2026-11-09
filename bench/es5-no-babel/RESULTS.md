# Table 3 ES5: Babel 비활성화 실험 결과

2026-09-24, a4 (AMD Ryzen 9 7950X), Node v24.14.1.
ES5 156개 사례, 사례·조건별 워밍업 프로세스 1회 및 측정 프로세스 5회.
각 조건의 측정 780회, 총 3,120회. 조건은 순차 실행했다.

| 조건 | TP | FP | FN | TN | Err | Precision | Recall | Accuracy | F1 | 평균 시간(ms) | Overhead |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| NodeMedic + Babel | 65 | 25 | 4 | 62 | 0 | 72.2% | 94.2% | 81.4% | 81.8% | 281.8 | 14.9× |
| NodeMedic, Babel 끔 | 65 | 25 | 4 | 62 | 0 | 72.2% | 94.2% | 81.4% | 81.8% | 64.5 | 3.4× |
| DynaJS | 67 | 19 | 2 | 68 | 0 | 77.9% | 97.1% | 86.5% | 86.5% | 71.4 | 3.8× |
| 일반 Node | — | — | — | — | 0 | — | — | — | — | 18.9 | 1.0× |

## 확인된 사실

- Babel on/off의 **개별 사례 판정 156개가 모두 동일**하다.
- 모든 조건에서 5회 반복 간 판정 차이, 오류, 타임아웃, 비정상 종료가 없다.
- NodeMedic와 DynaJS의 confusion matrix 모두 기존 Table 3의 ES5 행을 재현한다.
- Babel 비활성화로 NodeMedic의 평균 전체 시간이 약 **77.1% 감소**했다
  (약 **4.37배** 빨라짐).
- Babel 없는 NodeMedic은 이 측정에서 DynaJS보다 전체 시간이 약 **9.7% 짧다**.
  따라서 ES5에서 DynaJS가 더 빠르다는 결론은 이 조건으로 일반화할 수 없다.
- 정확도 차이는 유지된다: DynaJS accuracy 86.5%, NodeMedic 81.4%.

## 해석 범위

Table 3와 같은 러너의 전체 프로세스 wall time을 사용했다. 이 시간에는
Node 시작, 프레임워크 초기화, 계측 및 실행이 포함된다. 워밍업도 별도
프로세스 실행이므로, 같은 프로세스에서 충분히 JIT 워밍업한 steady-state
실행 시간은 아니다.

보조 지표인 본문 실행 시간(사례별 5회 최솟값의 평균)은 Babel on 1.889ms,
Babel off 1.995ms, DynaJS 0.809ms였다. 이는 전체 시간과 다른 측정 구간이다.
Babel 제거로 관찰한 전체 시간 감소를 분석 본문의 실행 속도 개선으로
해석해서는 안 된다. Babel 로딩과 변환의 개별 기여도는 분리 측정하지 않았다.

ES6+는 이번에 재측정하지 않았다. 기존 ES6+ 시간과 이번 ES5 시간을 섞어
새 Overall 시간을 만들지 않았다. 논문 및 원래 분석기 소스는 수정하지 않았다.

## 설정과 결과 위치

설정 변경은 실험용 Jalangi 복사본에서 Babel import, 초기 빈 문자열 변환,
helper/regenerator preload, 프로그램 변환을 제거한 것이다. 원본 ES5 코드를
기존 Acorn/Jalangi 계측기에 직접 전달한다. NodeMedic 분석·정책·판정 방식은
동일하다. 양쪽 모두 독립된 복사본에서 실행했다.

- [재현 방법](README.md)
- [정확한 집계 값](results-20260924/summary.json)
- [환경·버전·벤치마크 해시](results-20260924/environment.json)
- [Babel on 원시 CSV](results-20260924/measured-babel-on/results.csv)
- [Babel off 원시 CSV](results-20260924/measured-babel-off/results.csv)
- [Node·DynaJS 원시 CSV](results-20260924/measured-reference/results.csv)
- [원시 로그 및 사용 소스 압축본](results-20260924/raw-results.tar.gz)
- 서버: `a4:/home/choems/experiments/es5-no-babel-20260924`.

서버의 기존 `NodeMedic-wip` 설치는 판정 ghost 함수를 지원하고 있으며,
Babel을 켠 조건에서 논문 수치를 재현했다. 로컬 `NodeMedic-FINE`에는 필요한
Jalangi 하위 모듈이 없어 서버에서 수행했다. 실험용 복사본을 처음 실행할 때
발견한 의존성 탐색 경로 문제는 기존 NodeMedic의 node_modules를 연결해 해결했다.
실패한 초기 smoke 결과는 최종 집계에 포함하지 않았다.
