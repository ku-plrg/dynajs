import pathlib
import shutil
import subprocess

import pytest


def pytest_addoption(parser):
    parser.addoption(
        "--update",
        "-U",
        action="store_true",
        help="Update expected .out files when actual output differs",
    )


@pytest.fixture(scope="session")
def dynajs_path():
    path = shutil.which("./dynajs")
    if path is None:
        pytest.skip("'./dynajs' executable not found")

    subprocess.run(["npm", "run", "build"], check=True)
    return pathlib.Path(path).resolve()


@pytest.fixture(scope="session")
def harness_path():
    path = pathlib.Path("tests/harness.js")
    if not path.exists():
        pytest.skip(f"{path} not found")

    return path.resolve()


@pytest.fixture
def run_plain_node(harness_path):
    def _run(args, **kwargs):
        return subprocess.run(
            ["node", "--require", str(harness_path), *map(str, args)],
            capture_output=True,
            text=True,
            check=False,
            **kwargs,
        )

    return _run


@pytest.fixture
def run_dynajs(harness_path, dynajs_path):
    def _run(analysis, args, mode="partial", **kwargs):
        mode_flag = "--full" if mode == "full" else "--partial"
        return subprocess.run(
            [
                "node",
                "--require",
                str(harness_path),
                str(dynajs_path),
                "analyze",
                mode_flag,
                "-a",
                analysis,
                *map(str, args),
            ],
            capture_output=True,
            text=True,
            check=False,
            **kwargs,
        )

    return _run
