import pathlib

import pytest

from target_files import iter_test_targets

HIERARCHY_DIR = pathlib.Path("tests/regression-trace/hierarchy")
ANALYSIS = "samples/HierarchyDemo.js"

def discover_hierarchy_cases():
    for js_file in iter_test_targets(HIERARCHY_DIR):
        out_file = js_file.with_suffix(".out")
        if out_file.exists():
            yield js_file, out_file

HIERARCHY_CASES = list(discover_hierarchy_cases())

@pytest.mark.parametrize(
    "js_file,out_file",
    HIERARCHY_CASES,
    ids=[js_file.name for js_file, _ in HIERARCHY_CASES],
)
def test_hierarchy(js_file, out_file, run_dynajs, request):
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
        else:
            assert actual == expected
