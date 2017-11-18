#!/usr/bin/env sh

current_dir=$(pwd)
target=$1
tarball_filename=$(npm pack | tail -n 1)

cd ${target}

npm install --no-save ${current_dir}/${tarball_filename}
