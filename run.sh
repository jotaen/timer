#!/bin/bash
# Use this script with https://run.jotaen.net

PATH="${PATH}:./node_modules/.bin/"

# Starts development environment in Docker.
run::dev-env() {
  docker build --tag "timer" .
  local args=()
	docker run \
		--rm \
		-it \
		--volume "${PWD}:/app" \
		--workdir /app \
		--publish "8000:8000" \
		"${args[@]}" \
		"timer"
}

# Install all dependencies.
run::install() {
  rm -rf node_modules
  pnpm install \
    --shamefully-hoist \
    --frozen-lockfile \
    --ignore-scripts
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
    local BUILD_INFO="$(date -u +"%Y-%m-%dT%H:%M:%SZ") [$(git rev-parse --short=8 HEAD)]"
    sed -i "s/YYYY-MM-DDTHH:MM:SSZ \[abcdef01\]/${BUILD_INFO}/g" public/index.html
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
#   --check   Only check, don’t change.
run::format() {
  local args=()
  if [[ "$1" == '--check' ]]; then
    args+=(--check)
  else
    args+=(--write)
  fi
  prettier \
    "${args[@]}" \
    src/
}
