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

### Simulating weather events

For demo purpose, the *Recommend* action can be called interactively to inject a weather event into the system.

![Architecture](http://g.gravizo.com/g?
  digraph G {
    node [fontname = "helvetica"]
    rankdir=BT
    ui -> recommend
    recommend -> database
    ui -> retrieve
    retrieve -> database
    ui -> acknowledge
    acknowledge -> database
    recommend -> erp
    ui -> erp
    {rank=same; ui -> erp [style=invis] }
    recommend [label="Recommend"]
    retrieve [label="Retrieve"]
    acknowledge [label="Acknowledge"]
    erp [shape=rect label="ERP service"]
    ui [label="Dashboard"]
    database [shape=circle width=1 fixedsize=true style=filled color="%234E96DB" fontcolor=white label="Database"]
  }
)

## Running the app on Bluemix

1. If you do not already have a Bluemix account, [sign up here](https://ibm.com/bluemix)

1. Clone the app to your local environment from your terminal using the following command:

  ```
  git clone https://github.com/IBM-Bluemix/logistics-wizard-recommendation.git
  ```

1. `cd` into the actions directory

  ```
  cd logistics-wizard-recommendation/actions
  ```

1. Get the dependencies, and use [webpack module bundler](https://webpack.github.io/) to create our final .js actions in the `dist` folder.

  ```
  npm install
  npm run build
  ```

1. `cd` to the parent directory

  ```
  cd ..
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

## Code Structure

| File | Description |
| ---- | ----------- |
|[**deploy.sh**](deploy.sh)|Helper script to install, uninstall, update the OpenWhisk trigger, actions, rules.|
|[**recommend.js**](actions/recommend.js)|Entry point for the Recommend action.|
|[**retrieve.js**](actions/retrieve.js)|Entry point for the Retrieve action.|
|[**acknowledge.js**](actions/acknowledge.js.js)|Entry point for the Acknowledge action.|
|[**webpack.config.js**](webpack.config.js)|Webpack configuration used to build OpenWhisk actions. This allows the actions to use modules (module versions) not packaged natively by OpenWhisk. Make sure to add explicit dependencies in the package.json for specific module versions used by the actions. The webpack build will look at the "dependencies" and *webpack* them. If a module is not listen in "dependencies" it is assumed to be provided by OpenWhisk.|
|[**package.json**](package.json)|List dependencies used by the actions.|
|[**test**](test)|Unit test for the actions to be executed outside of OpenWhisk.|

## Troubleshooting

Polling activations is good start to debug the OpenWhisk action execution. Run
```
wsk activation poll
```
and invoke actions.

## License

See [License.txt](License.txt) for license information.
