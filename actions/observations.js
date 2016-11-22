/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @module observations
 */
const async = require('async');

/**
 * OpenWhisk entry point.
 *
 * @param {Object} args Expected arguments:
 * <li> {number} latitude
 * <li> {number} longitude
 * <li> {string} services.weather.url - URL to the weather service
 * @returns {Object}
 * <li> {Object} observation
 * <li> {Object[]} forecasts
 * <li> {Object} alerts
 */
function main(args) {
  console.log('Get weather for', args.latitude, args.longitude);

  const observations = {
    observation: {},
    forecasts: [],
    alerts: []
  };

  const weather = require('./weather.js')(args['services.weather.url']);
  async.parallel([
    // get current weather
    function(callback) {
      weather.currentByGeolocation(args.latitude, args.longitude, {}, (err, response) => {
        if (err) {
          callback(err);
        } else {
          console.log('Retrieved current observation');
          observations.observation = response.observation;
          callback(null);
        }
      });
    },
    // get 10-day forecasts
    function(callback) {
      weather.tendayByGeolocation(args.latitude, args.longitude, {}, (err, response) => {
        if (err) {
          callback(err);
        } else {
          console.log('Retrieved forecasts');
          observations.forecasts = response.forecasts;
          callback(null);
        }
      });
    },
    // get alerts
    function(callback) {
      weather.alertsByGeolocation(args.latitude, args.longitude, {}, (err, response) => {
        if (err) {
          callback(err);
        } else {
          console.log('Retrieved alerts');
          observations.alerts = response.alerts;
          callback(null);
        }
      });
    }
  ], (err, result) => {
    if (err) {
      console.log('[KO]', err);
      whisk.done(null, err);
    } else {
      console.log('[OK] Got weather');
      whisk.done(observations);
    }
  });

  return whisk.async();
}
exports.main = global.main = main;
