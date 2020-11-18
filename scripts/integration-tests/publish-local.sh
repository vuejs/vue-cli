#!/bin/bash

#==============================================================================#
#                                  SETUP                                       #
#==============================================================================#

# Start in scripts/integration-tests/ even if run from root directory
cd "$(dirname "$0")"

source ./local-registry.sh
source ./git.sh
source ./cleanup.sh

# Echo every command being executed
set -x

# Go to the root of the monorepo
cd ../..

initializeE2Egit

#==============================================================================#
#                                 PUBLISH                                      #
#==============================================================================#

yarn

startLocalRegistry "$PWD"/scripts/integration-tests/verdaccio-config.yml
publishToLocalRegistry
cleanup
