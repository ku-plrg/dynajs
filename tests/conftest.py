import os
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
def repo_root():
    return pathlib.Path(__file__).resolve().parent.parent


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
def run_dynajs(dynajs_path, repo_root):
    def _run(analysis, args, mode="partial", **kwargs):
        extra_env = dict(kwargs.pop("env", {}))
        options = [f"--analysis={(repo_root / analysis).resolve()}", "--pos", "persist"]
        if mode == "partial":
            options.append("--partial")
        else:
            options.append("--full")
        base_env = dict(os.environ)
        existing_options = base_env.get("DYNAJS_OPTIONS")
        if existing_options:
            options = [existing_options, *options]

        env = {
            **base_env,
            **extra_env,
            "DYNAJS_HOME": str(repo_root),
            "DYNAJS_OPTIONS": " ".join(map(str, options)),
        }

        return subprocess.run(
            [
                str(dynajs_path),
                "node",
                *map(str, args),
            ],
            capture_output=True,
            text=True,
            check=False,
            env=env,
            **kwargs,
        )

    return _run
