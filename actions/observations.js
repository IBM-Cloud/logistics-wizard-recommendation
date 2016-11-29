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

const self = exports;

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

  return new Promise((resolve, reject) => {
    self.observations(
      args['services.weather.url'],
      args.latitude,
      args.longitude,
      (err, result) => {
        if (err) {
          console.log('[KO]', err);
          reject({ ok: false });
        } else {
          console.log('[OK] Got weather');
          resolve(result);
        }
      }
    );
  });
}
exports.main = global.main = main;

function observations(weatherUrl, latitude, longitude, observeCallback) {
  const result = {
    observation: {},
    forecasts: [],
    alerts: []
  };

  const weather = require('./weather.js')(weatherUrl);
  async.parallel([
    // get current weather
    function(callback) {
      weather.currentByGeolocation(latitude, longitude, {}, (err, response) => {
        if (err) {
          callback(err);
        } else {
          console.log('Retrieved current observation');
          result.observation = response.observation;
          callback(null);
        }
      });
    },
    // get 10-day forecasts
    function(callback) {
      weather.tendayByGeolocation(latitude, longitude, {}, (err, response) => {
        if (err) {
          callback(err);
        } else {
          console.log('Retrieved forecasts');
          result.forecasts = response.forecasts;
          callback(null);
        }
      });
    },
    // get alerts
    function(callback) {
      weather.alertsByGeolocation(latitude, longitude, {}, (err, response) => {
        if (err) {
          callback(err);
        } else {
          console.log('Retrieved alerts');
          result.alerts = response.alerts;
          callback(null);
        }
      });
    }
  ], (err) => {
    if (err) {
      observeCallback(err);
    } else {
      observeCallback(null, result);
    }
  });
}
exports.observations = observations;
