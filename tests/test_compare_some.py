import pathlib

import pytest


COMPARE_SOME_DIR = pathlib.Path("tests/regression-trace/compare-some")
ANALYSIS = "samples/CompareSome.js"


def discover_compare_some_cases():
    for js_file in sorted(COMPARE_SOME_DIR.rglob("*.js")):
        if js_file.name.endswith("__dynajs__.js"):
            continue

        out_file = js_file.with_suffix(".out")
        if out_file.exists():
            yield js_file, out_file


COMPARE_SOME_CASES = list(discover_compare_some_cases())


@pytest.mark.parametrize(
    "js_file,out_file",
    COMPARE_SOME_CASES,
    ids=[str(js_file.relative_to(COMPARE_SOME_DIR)) for js_file, _ in COMPARE_SOME_CASES],
)
def test_compare_some(js_file, out_file, run_dynajs, request):
    result = run_dynajs(ANALYSIS, [js_file], mode="partial")
    assert result.returncode == 0, (
        f"{js_file} exited with code {result.returncode}\n"
        f"stdout:\n{result.stdout}\n"
        f"stderr:\n{result.stderr}"
    )

    actual = result.stdout.strip()
    expected = out_file.read_text().strip()
    if actual != expected:
        if request.config.getoption("--update"):
            out_file.write_text(actual + "\n")
            pytest.skip(f"Updated expected output for {out_file.name}")

        assert actual == expected
