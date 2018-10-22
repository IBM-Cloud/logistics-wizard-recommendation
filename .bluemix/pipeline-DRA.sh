# devops insights service

# install devops CLI (requires node)
npm install -g grunt-idra3

# set env vars
export DEPLOYABLE_ID=$PACKAGE_NAME
export NUM_ACTIONS=$(bx cloud-functions action list $PACKAGE_NAME | wc -l)

echo $NUM_ACTIONS actions were deployed in package $PACKAGE_NAME

if [ "$NUM_ACTIONS" = "6" ]; then
  export STATUS=pass
else
  export STATUS=fail
fi

# upload deployment record
idra --publishdeployrecord  --env=$LOGICAL_ENV_NAME --status=$STATUS --deployableid=$DEPLOYABLE_ID