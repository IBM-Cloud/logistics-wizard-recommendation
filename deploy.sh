#!/bin/bash
#
# Copyright 2016 IBM Corp. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the “License”);
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#  https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an “AS IS” BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# load configuration variables
source local.env

# capture the namespace where actions will be created
CURRENT_NAMESPACE=`wsk property get --namespace | awk '{print $3}'`
echo "Current namespace is $CURRENT_NAMESPACE."

# PACKAGE_NAME is configurable so that multiple versions of the actions
# can be deployed in different packages under the same namespace
if [ -z $PACKAGE_NAME ]; then
  PACKAGE_NAME=logistics-wizard-recommendation
fi

function usage() {
  echo "Usage: $0 [--install,--uninstall,--update,--env]"
}

function install() {

  echo "Creating database..."
  # ignore "database already exists error"
  curl -s -X PUT $CLOUDANT_URL/$CLOUDANT_DATABASE | grep -v file_exists

  echo "Inserting database design documents..."
  # ignore "document already exists error"
  curl -s -X POST -H 'Content-Type: application/json' -d @database-designs.json $CLOUDANT_URL/$CLOUDANT_DATABASE/_bulk_docs | grep -v conflict

  echo "Creating $PACKAGE_NAME package"
  wsk package create $PACKAGE_NAME\
    -p services.controller.url $CONTROLLER_SERVICE\
    -p services.weather.url $WEATHER_SERVICE\
    -p services.cloudant.url $CLOUDANT_URL\
    -p services.cloudant.database $CLOUDANT_DATABASE

  echo "Creating actions"
  wsk action create $PACKAGE_NAME/recommend\
    -a description 'Recommend new shipments based on weather conditions'\
    dist/recommend.bundle.js
  wsk action create $PACKAGE_NAME/retrieve\
    -a description 'Return the list of recommendations'\
    actions/retrieve.js
  wsk action create $PACKAGE_NAME/acknowledge\
    -a description 'Acknowledge a list of recommendations'\
    actions/acknowledge.js
  wsk action create $PACKAGE_NAME/observations\
    -a description 'Return weather observations for a location'\
    dist/observations.bundle.js
  wsk action create $PACKAGE_NAME/prepare-for-slack\
    -a description 'Transform a recommendation into a Slack message'\
    actions/prepare-for-slack.js
}

function uninstall() {
  echo "Removing actions..."
  wsk action delete $PACKAGE_NAME/recommend
  wsk action delete $PACKAGE_NAME/retrieve
  wsk action delete $PACKAGE_NAME/acknowledge
  wsk action delete $PACKAGE_NAME/observations
  wsk action delete $PACKAGE_NAME/prepare-for-slack

  echo "Removing package..."
  wsk package delete $PACKAGE_NAME

  echo "Done"
  wsk list
}

function update() {
  echo "Updating actions..."
  wsk action update $PACKAGE_NAME/recommend         dist/recommend.bundle.js
  wsk action update $PACKAGE_NAME/retrieve          actions/retrieve.js
  wsk action update $PACKAGE_NAME/acknowledge       actions/acknowledge.js
  wsk action update $PACKAGE_NAME/observations      dist/observations.bundle.js
  wsk action update $PACKAGE_NAME/prepare-for-slack actions/prepare-for-slack.js
}

function showenv() {
  echo "PACKAGE_NAME=$PACKAGE_NAME"
  echo "CONTROLLER_SERVICE=$CONTROLLER_SERVICE"
  echo "WEATHER_SERVICE=$WEATHER_SERVICE"
  echo "CLOUDANT_URL=$CLOUDANT_URL"
  echo "CLOUDANT_DATABASE=$CLOUDANT_DATABASE"
}

case "$1" in
"--install" )
install
;;
"--uninstall" )
uninstall
;;
"--update" )
update
;;
"--env" )
showenv
;;
* )
usage
;;
esac
