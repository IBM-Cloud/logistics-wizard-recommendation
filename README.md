[Logistics Wizard](https://github.com/IBM-Cloud/logistics-wizard/tree/master#logistics-wizard-overview) / [Architecture](https://github.com/IBM-Cloud/logistics-wizard/tree/master#architecture) / logistics-wizard-recommendation

# Logistics Wizard - Weather Recommendation

This service monitors the weather conditions around retail stores and makes recommendations on additional shipments of goods.

It is built with IBM Cloud Functions highlighting how Functions can be used to implement a backend API. The Functions actions are:

  * **Recommend** - given weather conditions, it evaluates the impact of the weather on shipments and stocks and makes recommendations for additional shipments, rerouting, etc.

  * **Retrieve** - returns the recommendations to be considered by a retail store manager.

  * **Acknowledge** - marks the recommendations as processed (approved or rejected) by a retail store manager.

  * **Observations** - returns weather conditions at a given location.

  * **Notify** - formats recommendations for notification messages.

### Simulating weather events

For demo purpose, the *Recommend* action can be called interactively to inject a weather event into the system.

![Architecture](https://g.gravizo.com/source/custom_mark10?https%3A%2F%2Fraw.githubusercontent.com%2FIBM-Cloud%2Flogistics-wizard-controller%2Fjune-sprint%2FREADME.md)

<details> 
<summary></summary>
custom_mark10
  digraph G {
    node [fontname = "helvetica"];
    rankdir=TB;
    weather -> recommend;
    recommend -> database;
    database -> notify;
    ui -> retrieve;
    ui -> observations;
    retrieve -> database;
    ui -> acknowledge;
    acknowledge -> database;
    recommend -> erp;
    ui -> erp;
    {rank=same; recommend -> notify -> retrieve -> retrieve [style=invis] };
    {rank=source; weather -> erp -> ui [style=invis]};
    weather [shape=rect label="Weather Company\\nData service" style=filled color="%234E96DB" fontcolor=white];
    recommend [label="Recommend" color="%232e8c70" style=filled fontcolor=white];
    notify [label="Notify" color="%232e8c70" style=filled fontcolor=white];
    retrieve [label="Retrieve" color="%232e8c70" style=filled fontcolor=white];
    acknowledge [label="Acknowledge" color="%232e8c70" style=filled fontcolor=white];
    observations [label="Observations" color="%232e8c70" style=filled fontcolor=white];
    erp [shape=rect label="ERP service" color="%238ec843" style=filled];
    ui [label="Dashboard" color="%23e8c228" style=filled];
    database [shape=circle width=1 fixedsize=true style=filled color="%234E96DB" fontcolor=white label="Database"];
custom_mark10
</details>

## Running the app on IBM Cloud

1. If you do not already have a IBM Cloud account, [sign up here](https://ibm.com/bluemix).

2. The Recommendation service depends on the [Controller](https://github.com/IBM-Cloud/logistics-wizard-controller) and [ERP](https://github.com/IBM-Cloud/logistics-wizard-erp) microservices. Deploy them first.

3. In IBM Cloud, create an instance of the Weather Company Data service.

  ```
  ibmcloud service create weatherinsights Free-v2 logistics-wizard-weatherinsights
  ```

4. Create a set of credentials for this service.

  ```
  ibmcloud service key-create logistics-wizard-weatherinsights for-openwhisk
  ```

5. View the credentials and take note of the `url` value.

  ```
  ibmcloud service key-show logistics-wizard-weatherinsights for-openwhisk
  ```

6. Create an instance of Cloudant to store the recommendations.

  ```
  ibmcloud service create cloudantNoSQLDB Lite logistics-wizard-recommendation-db
  ```

7. Create a set of credentials for this service.

  ```
  ibmcloud service key-create logistics-wizard-recommendation-db for-openwhisk
  ```

8. View the credentials and take note of the `url` value.

  ```
  ibmcloud service key-show logistics-wizard-recommendation-db for-openwhisk
  ```

9. Clone the app to your local environment from your terminal using the following command.

  ```
  git clone https://github.com/IBM-Cloud/logistics-wizard-recommendation.git
  ```

10. Change directory using `cd logistics-wizard-recommendation`.

11. Copy the file named template-local.env into local.env.

  ```
  cp template-local.env local.env
  ```

12. In local.env, update the location of the CONTROLLER_SERVICE, the url of the Weather Company Data service, and the url of the Cloudant database.

13. Get the dependencies, and use [webpack module bundler](https://webpack.github.io/) to create our final .js actions in the `dist` folder.

  ```
  npm install
  npm run build
  ```

14. Ensure your [IBM Cloud Functions command line interface](https://console.ng.bluemix.net/openwhisk/cli) is property configured with:

  ```
  ibmcloud cloud-functions list
  ```

  This shows the packages, actions, triggers and rules currently deployed in your Functions namespace.

15. Deploy the Functions artifacts

  ```
  ./deploy.sh --install
  ```

  Note: the script can also be used to --uninstall the Functions artifacts to --update the artifacts if you change the action code, or simply with --env to show the environment variables set in *local.env*.

## Code Structure

| File | Description |
| ---- | ----------- |
|[**deploy.sh**](deploy.sh)|Helper script to create the recommendations database, install, uninstall, update the Functions trigger, actions, rules.|
|[**template-local.env**](template-local.env)|Contains environment variables used by the deployment script. Duplicate this file into `local.env` to customize it for your environment.|
|[**package.json**](package.json)|List dependencies used by the actions and the build process.|
|[**webpack.config.js**](webpack.config.js)|Webpack configuration used to build Functions actions. This allows the actions to use modules (module versions) not packaged natively by Functions. Make sure to add explicit dependencies in the package.json for specific module versions used by the actions. The webpack build will look at the "dependencies" and *webpack* them. If a module is not listen in "dependencies" it is assumed to be provided by Functions.|
|[**recommend.js**](actions/recommend.js)|Entry point for the Recommend action.|
|[**prepare-for-slack.js**](actions/prepare-for-slack.js)|Entry point for the Notify action. It formats newly added recommendations into a text suitable for a Slack post message.|
|[**retrieve.js**](actions/retrieve.js)|Entry point for the Retrieve action.|
|[**acknowledge.js**](actions/acknowledge.js)|Entry point for the Acknowledge action.|
|[**observations.js**](actions/observations.js)|Entry point for the Observations action.|
|[**test**](test)|Unit test for the actions to be executed outside of Functions.|

## Troubleshooting

Polling activations is good start to debug the Functions action execution. Run
```
ibmcloud cloud-functions poll
```
and invoke actions.

## License

See [License.txt](License.txt) for license information.

## Status

| **master** | [![Build Status](https://travis-ci.org/IBM-Cloud/logistics-wizard-recommendation.svg?branch=master)](https://travis-ci.org/IBM-Cloud/logistics-wizard-recommendation) [![Coverage Status](https://coveralls.io/repos/github/IBM-Cloud/logistics-wizard-recommendation/badge.svg?branch=master)](https://coveralls.io/github/IBM-Cloud/logistics-wizard-recommendation?branch=master) |
| ----- | ----- |
| **dev** | [![Build Status](https://travis-ci.org/IBM-Cloud/logistics-wizard-recommendation.svg?branch=dev)](https://travis-ci.org/IBM-Cloud/logistics-wizard-recommendation) [![Coverage Status](https://coveralls.io/repos/github/IBM-Cloud/logistics-wizard-recommendation/badge.svg?branch=dev)](https://coveralls.io/github/IBM-Cloud/logistics-wizard-recommendation?branch=dev)|
