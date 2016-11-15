# Logistics Wizard Weather Recommendation

| **master** | [![Build Status](https://travis-ci.org/IBM-Bluemix/logistics-wizard-recommendation.svg?branch=master)](https://travis-ci.org/IBM-Bluemix/logistics-wizard-recommendation) [![Coverage Status](https://coveralls.io/repos/github/IBM-Bluemix/logistics-wizard-recommendation/badge.svg?branch=master)](https://coveralls.io/github/IBM-Bluemix/logistics-wizard-recommendation?branch=master) |
| ----- | ----- |
| **dev** | [![Build Status](https://travis-ci.org/IBM-Bluemix/logistics-wizard-recommendation.svg?branch=dev)](https://travis-ci.org/IBM-Bluemix/logistics-wizard-recommendation) [![Coverage Status](https://coveralls.io/repos/github/IBM-Bluemix/logistics-wizard-recommendation/badge.svg?branch=dev)](https://coveralls.io/github/IBM-Bluemix/logistics-wizard-recommendation?branch=dev)|

**WORK IN PROGRESS**

This service is part of the larger [Logistics Wizard](https://github.com/IBM-Bluemix/logistics-wizard) project.

## Overview

This service monitors the weather conditions around retail stores and make recommendation on additional shipments of goods.

It is built with OpenWhisk highlighting how OpenWhisk can be used to implement a backend API. The OpenWhisk actions are:

  * **Recommend** - given weather conditions, it evaluates the impact of the weather on shipments and stocks and make recommendations for additional shipments, rerouting, etc.

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
    /* styling */
    recommend [label="Recommend"]
    retrieve [label="Retrieve"]
    acknowledge [label="Acknowledge"]
    erp [shape=rect label="ERP service"]
    ui [label="Dashboard"]
    database [shape=circle width=1 fixedsize=true style=filled color="%234E96DB" fontcolor=white label="Database"]
  }
)

## Code Structure

| File | Description |
| ---- | ----------- |
|[**deploy.sh**](deploy.sh)|Helper script to install, uninstall, update the OpenWhisk trigger, actions, rules.|
|[**recommend.js**](actions/recommend.js)|Entry point for the Recommend action.|
|[**retrieve.js**](actions/retrieve.js)|Entry point for the Retrieve action.|
|[**acknowledge.js**](actions/acknowledge.js.js)|Entry point for the Acknowledge action.|
|[**package.json**](actions/package.js)|List dependencies used by the actions.|

## License

See [License.txt](License.txt) for license information.
