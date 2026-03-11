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
            [dynajs_path, "analyze", "--partial", "-a", "samples/TraceAll.js"] + args,
            capture_output=True,
            text=True,        # stdout/stderr to string
            check=False,      # not raise exception on non-zero exit
            **kwargs,
        )
    return _run

@pytest.fixture
def run_hierarchy(dynajs_path):
    def _run(args, **kwargs):
        return subprocess.run(
            [dynajs_path, "analyze", "--partial", "-a", "samples/HierarchyDemo.js"] + args,
            capture_output=True,
            text=True,
            check=False,
            **kwargs,
        )
    return _run

HIERARCHY_DIR = pathlib.Path("tests/hierarchy")

def discover_hierarchy_cases():
    for js_file in HIERARCHY_DIR.rglob("*.js"):
        out_file = js_file.with_suffix(".out")
        if out_file.exists():
            yield js_file, out_file

HIERARCHY_CASES = list(discover_hierarchy_cases())

@pytest.mark.parametrize(
    "js_file,out_file",
    HIERARCHY_CASES,
    ids=[js_file.name for js_file, _ in HIERARCHY_CASES],
)
def test_hierarchy(js_file, out_file, run_hierarchy, request):
    result = run_hierarchy([str(js_file)])
    actual = result.stdout.strip()
    expected = out_file.read_text().strip()
    if actual != expected:
        if request.config.getoption("--update"):
            out_file.write_text(actual + "\n")
            pytest.skip(f"Updated expected output for {out_file.name}")
        else:
            assert actual == expected
