#!/bin/sh
set -eu
project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
test_binary=$(mktemp /tmp/pinkhack-voice-drivers.XXXXXX)
trap 'rm -f "$test_binary"' EXIT
c++ -std=c++17 -pthread -Wall -Wextra \
  -I"$project_dir/tests/stubs" \
  -I"$project_dir/modules/microphone" -I"$project_dir/modules/speaker" \
  "$project_dir/tests/driver_test.cpp" \
  "$project_dir/modules/microphone/microphone.cpp" "$project_dir/modules/speaker/speaker.cpp" \
  -o "$test_binary"
"$test_binary"
