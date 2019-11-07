#!/bin/bash
# Called by the pipeline from the checkout directory
npm config delete prefix
nvm install 6.9.1
npm install
npm run build
if [ -z ${COVERALLS_REPO_TOKEN} ]; then
  npm run localcoverage
  echo No Coveralls token specified, skipping coveralls.io upload
else
  npm run coverage
fi
