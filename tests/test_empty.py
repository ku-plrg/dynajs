# This test is meant to check if printing of disabled features is working correctly.
import pathlib
import shutil
import subprocess

import pytest


@pytest.fixture(scope="session")
def dynajs_path():
    path = shutil.which("./dynajs")
    if path is None:
        pytest.skip("'./dynajs' executable not found")
    subprocess.run(["npm", "run", "build"], check=True)
    return path


@pytest.fixture(scope="session")
def harness_path():
    path = pathlib.Path("./tests/harness.js")
    if not path.exists():
        pytest.skip(f"{path} not found")
    return path.resolve()


@pytest.fixture
def run_plain(harness_path):
    def _run(args, **kwargs):
        return subprocess.run(
            ["node", "--require", str(harness_path)] + args,
            capture_output=True,
            text=True,
            check=False,
            **kwargs,
        )
    return _run


@pytest.fixture
def run_dynajs(harness_path, dynajs_path):
    def _run(args, **kwargs):
        return subprocess.run(
            [
                "node",
                "--require",
                str(harness_path),
                dynajs_path,
                "analyze",
                "--partial",
                "-a",
                "samples/EmptyAnalysis.js",
            ] + args,
            capture_output=True,
            text=True,
            check=False,
            **kwargs,
        )
    return _run


TEST_DIR = pathlib.Path("tests/empty")


def discover_cases():
    for js_file in TEST_DIR.rglob("*.js"):
        if not js_file.name.endswith("__dynajs__.js"):
            yield js_file


CASES = list(discover_cases())


@pytest.mark.parametrize("js_file", CASES, ids=[js_file.name for js_file in CASES])
def test_empty_analysis_stdout_matches_plain_node(js_file, run_plain, run_dynajs):
    baseline = run_plain([str(js_file)])
    assert baseline.returncode == 0, (
        f"{js_file} failed in plain node mode with code {baseline.returncode}\n"
        f"stdout:\n{baseline.stdout}\n"
        f"stderr:\n{baseline.stderr}"
    )

    result = run_dynajs([str(js_file)])
    assert result.returncode == 0, (
        f"{js_file} failed in dynajs mode with code {result.returncode}\n"
        f"stdout:\n{result.stdout}\n"
        f"stderr:\n{result.stderr}"
    )
    assert result.stdout == baseline.stdout, (
        f"{js_file} produced different stdout under dynajs\n"
        f"plain stdout:\n{baseline.stdout}\n"
        f"dynajs stdout:\n{result.stdout}\n"
        f"dynajs stderr:\n{result.stderr}"
    )
