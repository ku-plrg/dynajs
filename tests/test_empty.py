import pathlib

import pytest

from target_files import iter_test_targets


TEST_DIR = pathlib.Path("tests/regression-node/empty")
ANALYSIS = "samples/EmptyAnalysis.js"


def discover_cases():
    yield from iter_test_targets(TEST_DIR)


CASES = list(discover_cases())


@pytest.mark.parametrize("js_file", CASES, ids=[js_file.name for js_file in CASES])
def test_empty_analysis_matches_plain_node(js_file, run_plain_node, run_dynajs):
    baseline = run_plain_node([js_file])
    result = run_dynajs(ANALYSIS, [js_file])

    assert result.returncode == baseline.returncode, (
        f"{js_file} produced a different exit code under dynajs\n"
        f"plain exit code: {baseline.returncode}\n"
        f"dynajs exit code: {result.returncode}\n"
        f"stdout:\n{baseline.stdout}\n"
        f"plain stderr:\n{baseline.stderr}\n"
        f"dynajs stdout:\n{result.stdout}\n"
        f"stderr:\n{result.stderr}"
    )
    assert result.stdout == baseline.stdout, (
        f"{js_file} produced different stdout under dynajs\n"
        f"plain stdout:\n{baseline.stdout}\n"
        f"dynajs stdout:\n{result.stdout}\n"
        f"plain stderr:\n{baseline.stderr}\n"
        f"dynajs stderr:\n{result.stderr}"
    )
