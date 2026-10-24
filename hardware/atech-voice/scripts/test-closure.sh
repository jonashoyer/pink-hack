#!/bin/sh
set -eu
project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
test_binary=$(mktemp /tmp/pinkhack-closure.XXXXXX)
trap 'rm -f "$test_binary"' EXIT
c++ -std=c++17 -Wall -Wextra -I"$project_dir/modules/microphone" "$project_dir/tests/closure_test.cpp" -o "$test_binary"
"$test_binary"
