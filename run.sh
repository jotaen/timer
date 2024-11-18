#!/bin/bash

PATH="${PATH}:./node_modules/.bin/"

# Starts development environment in Docker.
run::dev-env() {
  docker build --tag "geek-timer" .
	docker run \
		--rm \
		-it \
		--volume "${PWD}:/app" \
		--workdir /app \
		--publish "8000:8000" \
		"geek-timer"
}

# Install all dependencies.
run::install() {
  npm install
}

# Starts dev server on port 8000.
run::server() {
	esbuild \
		src/Main/index.tsx \
		--bundle \
		--outfile=public/dist/bundle.js \
		--watch \
		--servedir=public
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
