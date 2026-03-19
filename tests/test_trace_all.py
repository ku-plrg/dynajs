import json
import pathlib

import pytest

from target_files import iter_test_targets


TEST_DIR = pathlib.Path("tests/regression-trace/trace-all")
ANALYSIS = "samples/TraceAll.js"
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


def discover_output_cases():
    for js_file in iter_test_targets(TEST_DIR):
        out_file = js_file.with_suffix(".out")
        if out_file.exists():
            yield js_file, out_file


OUTPUT_CASES = list(discover_output_cases())
OUTPUT_CASE_PATHS = {js_file for js_file, _ in OUTPUT_CASES}


def discover_exit_only_cases():
    for js_file in iter_test_targets(TEST_DIR):
        if js_file not in OUTPUT_CASE_PATHS:
            yield js_file


EXIT_ONLY_CASES = list(discover_exit_only_cases())


@pytest.mark.parametrize(
    "js_file,out_file",
    OUTPUT_CASES,
    ids=[str(js_file.relative_to(TEST_DIR)) for js_file, _ in OUTPUT_CASES],
)
def test_trace_all_output(js_file, out_file, run_dynajs, request):
    result = run_dynajs(ANALYSIS, [js_file], mode="partial")
    assert_expected_exit_code(result, js_file)

    actual = result.stdout.strip()
    expected = out_file.read_text().strip()
    if actual != expected:
        if request.config.getoption("--update"):
            out_file.write_text(actual + "\n")
            pytest.skip(f"Updated expected output for {out_file.name}")

        assert actual == expected


@pytest.mark.parametrize(
    "js_file",
    EXIT_ONLY_CASES,
    ids=[str(js_file.relative_to(TEST_DIR)) for js_file in EXIT_ONLY_CASES],
)
def test_trace_all_exit(js_file, run_dynajs):
    result = run_dynajs(ANALYSIS, [js_file], mode="partial")
    assert_expected_exit_code(result, js_file)
