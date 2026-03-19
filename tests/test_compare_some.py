import json
import pathlib

import pytest

from target_files import iter_test_targets


COMPARE_SOME_DIR = pathlib.Path("tests/regression-trace/compare-some")
ANALYSIS = "samples/CompareSome.js"
EXPECTED_EXIT_CODES_PATH = pathlib.Path("tests/expected_exit_codes")
EXPECTED_EXIT_CODES = {
    pathlib.Path(path): code
    for path, code in json.loads(EXPECTED_EXIT_CODES_PATH.read_text()).items()
}


def assert_expected_exit_code(result, js_file):
    expected = EXPECTED_EXIT_CODES.get(js_file, 0)
    assert result.returncode == expected, (
        f"{js_file} exited with code {result.returncode}, expected {expected}\n"
        f"stdout:\n{result.stdout}\n"
        f"stderr:\n{result.stderr}"
    )


def discover_compare_some_cases():
    for js_file in iter_test_targets(COMPARE_SOME_DIR):
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
    assert_expected_exit_code(result, js_file)

    actual = result.stdout.strip()
    expected = out_file.read_text().strip()
    if actual != expected:
        if request.config.getoption("--update"):
            out_file.write_text(actual + "\n")
            pytest.skip(f"Updated expected output for {out_file.name}")

        assert actual == expected
