#!/bin/bash

# Configure the IBM Cloud CLI
echo Login IBM Cloud api=$CF_TARGET_URL org=$CF_ORG space=$CF_SPACE
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

# create the database
if [ -z "$CLOUDANT_SERVICE_PLAN" ]; then
  CLOUDANT_SERVICE_PLAN=Lite
fi

ibmcloud cf create-service cloudantNoSQLDB $CLOUDANT_SERVICE_PLAN logistics-wizard-recommendation-db

# create a key for this service
until ibmcloud cf create-service-key logistics-wizard-recommendation-db for-openwhisk
do
  echo "Will retry..."
  sleep 10
done

# retrieve the URL - it contains credentials + API URL
CREDENTIALS_JSON=$(ibmcloud cf service-key logistics-wizard-recommendation-db for-openwhisk | tail -n+5)
export CLOUDANT_URL=$(echo $CREDENTIALS_JSON | jq -r .url)

# Deploy the OpenWhisk triggers/actions/rules
./deploy.sh --env
./deploy.sh --uninstall
./deploy.sh --install
