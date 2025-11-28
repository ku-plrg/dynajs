import subprocess
import pathlib
import shutil
import pytest

@pytest.fixture(scope="session")
def dynajs_path():
    path = shutil.which("./dynajs")
    if path is None:
        pytest.skip("'./dynajs' executable not found")
    subprocess.run(["npm", "run", "build"], check=True)
    return path


@pytest.fixture
def run_dynajs(dynajs_path):
    def _run(args, **kwargs):
        return subprocess.run(
            [dynajs_path, "analyze", "-a", "samples/TraceAll.js"] + args,
            capture_output=True,
            text=True,        # stdout/stderr to string
            check=False,      # not raise exception on non-zero exit
            **kwargs,
        )
    return _run

TEST_DIR = pathlib.Path("tests/basic")

def discover_cases():
    for js_file in TEST_DIR.rglob("*.js"):
        out_file = js_file.with_suffix(".out")
        if out_file.exists():
            yield js_file, out_file

CASES = list(discover_cases())

@pytest.mark.parametrize(
    "js_file,out_file",
    CASES,
    ids=[js_file.name for js_file, _ in CASES],
)
def test_basic(js_file, out_file, run_dynajs, request):
    result = run_dynajs([str(js_file)])
    actual = result.stdout.strip()
    expected = out_file.read_text().strip()
    if actual != expected:
        if request.config.getoption("--update"):
            out_file.write_text(actual + "\n")
            pytest.skip(f"Updated expected output for {out_file.name}")
        else:
            assert actual == expected
