#!/bin/sh

# check ptw is installed
if ! command -v ptw &> /dev/null
then
    echo "ptw could not be found, please install it first."
    if ! command -v pip &> /dev/null
    then
        echo "pip is not installed. Please install pip first."
        exit 1
    fi
    echo "Installing pytest-watch..."
    pip install pytest-watch
fi

# watch mode
if [ "$1" = "--watch" ] || [ "$1" = "-w" ]; then
    shift
    ptw -- "$@"
    exit
fi
# normal mode
pytest "$@"
