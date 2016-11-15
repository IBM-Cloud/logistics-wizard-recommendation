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
  echo "Creating $PACKAGE_NAME package"
  wsk package create $PACKAGE_NAME

  echo "Creating actions"
  wsk action create $PACKAGE_NAME/recommend   actions/dist/recommend.bundle.js
  wsk action create $PACKAGE_NAME/retrieve    actions/dist/retrieve.bundle.js
  wsk action create $PACKAGE_NAME/acknowledge actions/dist/acknowledge.bundle.js
}

function uninstall() {
  echo "Removing actions..."
  wsk action delete $PACKAGE_NAME/recommend
  wsk action delete $PACKAGE_NAME/retrieve
  wsk action delete $PACKAGE_NAME/acknowledge

  echo "Removing package..."
  wsk package delete $PACKAGE_NAME

  echo "Done"
  wsk list
}

function update() {
  echo "Updating actions..."
  wsk action update $PACKAGE_NAME/recommend   actions/dist/recommend.bundle.js
  wsk action update $PACKAGE_NAME/retrieve    actions/dist/retrieve.bundle.js
  wsk action update $PACKAGE_NAME/acknowledge actions/dist/acknowledge.bundle.js
}

function showenv() {
  echo "PACKAGE_NAME=$PACKAGE_NAME"
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
