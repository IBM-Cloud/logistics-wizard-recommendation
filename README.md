# Logistics Wizard - Weather Recommendation

| **master** | [![Build Status](https://travis-ci.org/IBM-Bluemix/logistics-wizard-recommendation.svg?branch=master)](https://travis-ci.org/IBM-Bluemix/logistics-wizard-recommendation) [![Coverage Status](https://coveralls.io/repos/github/IBM-Bluemix/logistics-wizard-recommendation/badge.svg?branch=master)](https://coveralls.io/github/IBM-Bluemix/logistics-wizard-recommendation?branch=master) |
| ----- | ----- |
| **dev** | [![Build Status](https://travis-ci.org/IBM-Bluemix/logistics-wizard-recommendation.svg?branch=dev)](https://travis-ci.org/IBM-Bluemix/logistics-wizard-recommendation) [![Coverage Status](https://coveralls.io/repos/github/IBM-Bluemix/logistics-wizard-recommendation/badge.svg?branch=dev)](https://coveralls.io/github/IBM-Bluemix/logistics-wizard-recommendation?branch=dev)|

**WORK IN PROGRESS**

This service is part of the larger [Logistics Wizard](https://github.com/IBM-Bluemix/logistics-wizard) project.

## Overview

This service monitors the weather conditions around retail stores and makes recommendations on additional shipments of goods.

It is built with OpenWhisk highlighting how OpenWhisk can be used to implement a backend API. The OpenWhisk actions are:

  * **Recommend** - given weather conditions, it evaluates the impact of the weather on shipments and stocks and makes recommendations for additional shipments, rerouting, etc.

  * **Retrieve** - returns the recommendations to be considered by a retail store manager.

  * **Acknowledge** - marks the recommendations as processed (approved or rejected) by a retail store manager.

  * **Observations** - returns weather conditions at a given location.

### Simulating weather events

For demo purpose, the *Recommend* action can be called interactively to inject a weather event into the system.

![Architecture](http://g.gravizo.com/g?
  digraph G {
    node [fontname = "helvetica"]
    rankdir=TB
    weather -> recommend
    recommend -> database
    database -> notify
    ui -> retrieve
    ui -> observations
    retrieve -> database
    ui -> acknowledge
    acknowledge -> database
    recommend -> erp
    ui -> erp
    {rank=same; recommend -> notify -> retrieve -> retrieve [style=invis] }
    {rank=source; weather -> erp -> ui [style=invis]}
    weather [shape=rect label="Weather Company\\nData service" style=filled color="%234E96DB" fontcolor=white]
    recommend [label="Recommend" color="%232e8c70" style=filled fontcolor=white]
    notify [label="Notify" color="%232e8c70" style=filled fontcolor=white]
    retrieve [label="Retrieve" color="%232e8c70" style=filled fontcolor=white]
    acknowledge [label="Acknowledge" color="%232e8c70" style=filled fontcolor=white]
    observations [label="Observations" color="%232e8c70" style=filled fontcolor=white]
    erp [shape=rect label="ERP service" color="%238ec843" style=filled]
    ui [label="Dashboard" color="%23e8c228" style=filled]
    database [shape=circle width=1 fixedsize=true style=filled color="%234E96DB" fontcolor=white label="Database"]
  }
)

## Running the app on Bluemix

1. If you do not already have a Bluemix account, [sign up here](https://ibm.com/bluemix)

1. The recommendation service depends on the [Controller](https://github.com/IBM-Bluemix/logistics-wizard-controller) and [ERP](https://github.com/IBM-Bluemix/logistics-wizard-erp) microservices. Make sure to deploy them first.

1. In Bluemix, create an instance of the Weather Company Data service

  ```
  cf create-service weatherinsights Free-v2 logistics-wizard-weatherinsights
  ```

1. Create a set of credentials for this service

  ```
  cf create-service-key logistics-wizard-weatherinsights for-openwhisk
  ```

1. View the credentials and take note of the `url` value

  ```
  cf service-key logistics-wizard-weatherinsights for-openwhisk
  ```

1. Create an instance of Cloudant to store the recommendations

  ```
  cf create-service cloudantNoSQLDB Lite logistics-wizard-recommendation-db
  ```

1. Create a set of credentials for this service

  ```
  cf create-service-key logistics-wizard-recommendation-db for-openwhisk
  ```

1. View the credentials and take note of the `url` value

  ```
  cf service-key logistics-wizard-recommendation-db for-openwhisk
  ```

1. Clone the app to your local environment from your terminal using the following command:

  ```
  git clone https://github.com/IBM-Bluemix/logistics-wizard-recommendation.git
  ```

1. `cd` into the checkout directory

1. Copy the file named template-local.env into local.env

  ```
  cp template-local.env local.env
  ```

1. In local.env, update the location of the CONTROLLER_SERVICE, the url of the Weather Company Data service, the url of the Cloudant database.

1. Get the dependencies, and use [webpack module bundler](https://webpack.github.io/) to create our final .js actions in the `dist` folder.

  ```
  npm install
  npm run build
  ```

1. Ensure your [OpenWhisk command line interface](https://console.ng.bluemix.net/openwhisk/cli) is property configured with:

  ```
  wsk list
  ```

  This shows the packages, actions, triggers and rules currently deployed in your OpenWhisk namespace.

1. Deploy the OpenWhisk artifacts

  ```
  ./deploy.sh --install
  ```

  Note: the script can also be used to --uninstall the OpenWhisk artifacts to --update the artifacts if you change the action code, or simply with --env to show the environment variables set in *local.env*.

## Code Structure

| File | Description |
| ---- | ----------- |
|[**deploy.sh**](deploy.sh)|Helper script to install, uninstall, update the OpenWhisk trigger, actions, rules.|
|[**template-local.env**](template-local.env)|Contains environment variables used by the deployment script. Duplicate this file into `local.env` to customize it for your environment.|
|[**package.json**](package.json)|List dependencies used by the actions and the build process.|
|[**webpack.config.js**](webpack.config.js)|Webpack configuration used to build OpenWhisk actions. This allows the actions to use modules (module versions) not packaged natively by OpenWhisk. Make sure to add explicit dependencies in the package.json for specific module versions used by the actions. The webpack build will look at the "dependencies" and *webpack* them. If a module is not listen in "dependencies" it is assumed to be provided by OpenWhisk.|
|[**recommend.js**](actions/recommend.js)|Entry point for the Recommend action.|
|[**prepare-for-slack.js**](actions/prepare-for-slack.js)|Entry point for the Notify action. It formats newly added recommendations into a text suitable for a Slack post message.|
|[**retrieve.js**](actions/retrieve.js)|Entry point for the Retrieve action.|
|[**acknowledge.js**](actions/acknowledge.js)|Entry point for the Acknowledge action.|
|[**observations.js**](actions/observations.js)|Entry point for the Observations action.|
|[**test**](test)|Unit test for the actions to be executed outside of OpenWhisk.|

## Troubleshooting

Polling activations is good start to debug the OpenWhisk action execution. Run
```
wsk activation poll
```
and invoke actions.

## License

See [License.txt](License.txt) for license information.
