#!/bin/bash

if [ -z "$OPENWHISK_API_HOST" ]; then
  echo 'OPENWHISK_API_HOST is not defined. Using default value.'
  export OPENWHISK_API_HOST=openwhisk.ng.bluemix.net
fi

# Configure the IBM Cloud CLI
echo 'Login IBM Cloud api=$CF_TARGET_URL org=$CF_ORG space=$CF_SPACE'
bx login -a "$CF_TARGET_URL" --apikey "$IAM_API_KEY" -o "$CF_ORG" -s "$CF_SPACE"

echo 'Existing Functions packages'
bx cloud-functions package list

# inject the location of the controller service
domain=".mybluemix.net"
case "${REGION_ID}" in
  ibm:yp:eu-gb)
    domain=".eu-gb.mybluemix.net"
  ;;
  ibm:yp:au-syd)
  domain=".au-syd.mybluemix.net"
  ;;
esac
if [ ! -z "$CONTROLLER_SERVICE_APP_NAME" ]; then
  export CONTROLLER_SERVICE=https://$CONTROLLER_SERVICE_APP_NAME$domain
fi
if [ -z "$CONTROLLER_SERVICE" ]; then
  echo "CONTROLLER_SERVICE url not defined."
  exit 1;
fi

if [ -z "$WEATHER_SERVICE" ]; then
  # create a Weather service
  bx service create weatherinsights Free-v2 logistics-wizard-weatherinsights
  # create a key for this service
  bx service key-create logistics-wizard-weatherinsights for-openwhisk
  # retrieve the URL - it contains credentials + API URL
  export WEATHER_SERVICE=`bx service key-show logistics-wizard-weatherinsights for-openwhisk | grep \"url\" | awk -F '"' '{print $4}'`
else
  echo 'Using configured url for Weather Company Data service'
fi

# create a Cloudant service
bx service create cloudantNoSQLDB Lite logistics-wizard-recommendation-db
# create a key for this service
bx service create logistics-wizard-recommendation-db for-openwhisk
# retrieve the URL - it contains credentials + API URL
export CLOUDANT_URL=`bx service key-show logistics-wizard-recommendation-db for-openwhisk | grep \"url\" | awk -F '"' '{print $4}'`

# Deploy the OpenWhisk triggers/actions/rules
./deploy.sh --uninstall
./deploy.sh --install
