#!/bin/bash

# Copied from https://github.com/facebook/create-react-app/blob/v4.0.0/tasks/local-registry.sh

custom_registry_url=http://localhost:4873
original_npm_registry_url=`npm get registry`
original_yarn_registry_url=`yarn config get registry`

function startLocalRegistry {
  # Start local registry
  tmp_registry_log=`mktemp`
  echo "Registry output file: $tmp_registry_log"
  nohup yarn verdaccio -c $1 &>$tmp_registry_log &
  # Wait for Verdaccio to boot
  grep -q 'http address' <(tail -f $tmp_registry_log)

  # Set registry to local registry
  npm set registry "$custom_registry_url"
  yarn config set registry "$custom_registry_url"
}

function stopLocalRegistry {
  # Restore the original NPM and Yarn registry URLs and stop Verdaccio
  npm set registry "$original_npm_registry_url"
  yarn config set registry "$original_yarn_registry_url"
}

function publishToLocalRegistry {
  git clean -df
  yarn release --local-registry
}
