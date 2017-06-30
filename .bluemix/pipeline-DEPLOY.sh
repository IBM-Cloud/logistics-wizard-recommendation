#!/bin/bash
echo 'Installing dependencies...'
sudo apt-get -qq update 1>/dev/null
sudo apt-get -qq install jq 1>/dev/null

# Get the OpenWhisk CLI
mkdir ~/wsk
curl https://openwhisk.ng.bluemix.net/cli/go/download/linux/amd64/wsk > ~/wsk/wsk
chmod +x ~/wsk/wsk
export PATH=$PATH:~/wsk

if [ -z "$OPENWHISK_API_HOST" ]; then
  echo 'OPENWHISK_API_HOST is not defined. Using default value.'
  export OPENWHISK_API_HOST=openwhisk.ng.bluemix.net
fi

if [ -z "$OPENWHISK_AUTH" ]; then
  echo 'OPENWHISK_AUTH is not defined. Retrieving OpenWhisk authorization key...'
  CF_ACCESS_TOKEN=`cat ~/.cf/config.json | jq -r .AccessToken | awk '{print $2}'`
  OPENWHISK_KEYS=`curl -XPOST -k -d "{ \"accessToken\" : \"$CF_ACCESS_TOKEN\", \"refreshToken\" : \"$CF_ACCESS_TOKEN\" }" \
    -H 'Content-Type:application/json' https://$OPENWHISK_API_HOST/bluemix/v2/authenticate`
  SPACE_KEY=`echo $OPENWHISK_KEYS | jq -r '.namespaces[] | select(.name == "'$CF_ORG'_'$CF_SPACE'") | .key'`
  SPACE_UUID=`echo $OPENWHISK_KEYS | jq -r '.namespaces[] | select(.name == "'$CF_ORG'_'$CF_SPACE'") | .uuid'`
  OPENWHISK_AUTH=$SPACE_UUID:$SPACE_KEY
fi

# Configure the OpenWhisk CLI
wsk property set --apihost "$OPENWHISK_API_HOST" --auth "${OPENWHISK_AUTH}"

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
  cf create-service weatherinsights Free-v2 logistics-wizard-weatherinsights
  # create a key for this service
  cf create-service-key logistics-wizard-weatherinsights for-openwhisk
  # retrieve the URL - it contains credentials + API URL
  export WEATHER_SERVICE=`cf service-key logistics-wizard-weatherinsights for-openwhisk | grep \"url\" | awk -F '"' '{print $4}'`
else
  echo 'Using configured url for Weather Company Data service'
fi

# create a Cloudant service
cf create-service cloudantNoSQLDB Lite logistics-wizard-recommendation-db
# create a key for this service
cf create-service-key logistics-wizard-recommendation-db for-openwhisk
# retrieve the URL - it contains credentials + API URL
export CLOUDANT_URL=`cf service-key logistics-wizard-recommendation-db for-openwhisk | grep \"url\" | awk -F '"' '{print $4}'`

# Deploy the OpenWhisk triggers/actions/rules
./deploy.sh --uninstall
./deploy.sh --install
