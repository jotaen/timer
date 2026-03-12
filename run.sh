#!/bin/bash

PATH="${PATH}:./node_modules/.bin/"

# Starts development environment in Docker.
run::dev-env() {
  PORT="${1:-8000}"
  docker build --tag "timer" .
	docker run \
		--rm \
		-it \
		--volume "${PWD}:/app" \
		--workdir /app \
		--publish "${PORT}:8000" \
		"timer"
}

# Install all dependencies.
run::install() {
  npm install
}

ESBUILD_ARGS=(
  src/App/index.tsx \
  --outfile=public/dist/bundle.js \
  --bundle
)

# Starts dev server.
run::server() {
	esbuild \
		"${ESBUILD_ARGS[@]}" \
		--watch \
		--servedir=public
}

# Builds frontend assets.
run::build() {
  esbuild \
		"${ESBUILD_ARGS[@]}" \
		--minify
	if [[ "$1" == '--prod' ]]; then
	  local TIMESTAMP="$(date +%s%3N)"
    sed -i "s/0000000000000/${TIMESTAMP}/g" public/index.html
	fi
}

# Run unit tests.
run::test() {
  mocha
}

# Run type checker.
run::check-types() {
  tsc --noEmit
}

# Check whether all files are formatted correctly.
run::check-format() {
  prettier \
    --check \
    src/
}

# Reformat all files.
run::format() {
  prettier \
    --write \
    src/
}

# Run all tests and checks.
run::test-all() {
  set -o errexit
  run::test
  run::check-types
  run::check-format
}
