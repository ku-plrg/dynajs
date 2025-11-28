def pytest_addoption(parser):
    parser.addoption(
        "--update", "-U", action="store_true",
        help="Update expected .out files when actual output differs"
    )
