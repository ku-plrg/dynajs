import pathlib


TEST_TARGET_SUFFIXES = (".js", ".cjs", ".mjs")


def is_instrumented_target(path: pathlib.Path) -> bool:
    return any(path.name.endswith(f"__dynajs__{suffix}") for suffix in TEST_TARGET_SUFFIXES)


def iter_test_targets(root: pathlib.Path):
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix not in TEST_TARGET_SUFFIXES:
            continue
        if is_instrumented_target(path):
            continue
        yield path
