import json
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
    path = pathlib.Path("./tests/exit/harness")
    if not path.exists():
        pytest.skip(f"{path} not found")
    resolved = path.resolve()
    return resolved

@pytest.fixture
def run_dynajs(harness_path, dynajs_path):
    def _run(args, **kwargs):
        return subprocess.run(
            ['node', '--require', harness_path, dynajs_path, "analyze", "-a", "samples/TraceAll.js"] + args,
            capture_output=True,
            text=True,
            check=False,
            **kwargs,
        )
    return _run


EXPECTED_EXIT_CODES_PATH = pathlib.Path("tests/expected_exit_codes.json")
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


TEST_DIR = pathlib.Path("tests/exit")


def discover_cases():
    for js_file in TEST_DIR.rglob("*.js"):
        if not js_file.name.endswith("__dynajs__.js"):
            yield js_file


CASES = list(discover_cases())


@pytest.mark.parametrize("js_file", CASES, ids=[js_file.name for js_file in CASES])
def test_scripts_exit_normally(js_file, run_dynajs):
    result = run_dynajs([str(js_file)])
    assert_expected_exit_code(result, js_file)
