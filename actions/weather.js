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
const request = require('request');
const _ = require('lodash');

function Weather(url) {
  const self = this;

  // http://twcservice.mybluemix.net/rest-api/
  const defaultOptions = {
    language: 'en-US',
    units: 'e'
  };

  self.callByGeolocation = function(endPoint, latitude, longitude, options, callback) {
    const mergedOptions = _.merge({}, defaultOptions, options);
    const callURL = `${url}/api/weather/v1/geocode/` +
      encodeURIComponent(latitude.toFixed(2)) + '/' +
      encodeURIComponent(longitude.toFixed(2)) +
      endPoint +
      (endPoint.indexOf('?') >= 0 ? '&' : '?') +
      'language=' + encodeURIComponent(mergedOptions.language) +
      '&units=' + encodeURIComponent(mergedOptions.units);

    request.get(
      {
        url: callURL,
        json: true
      },
      (error, response, body) => {
        if (response.statusCode !== 200) {
          callback({ ok: false, statusCode: response.statusCode });
        } else {
          callback(error, body);
        }
      });
  };

  self.currentByGeolocation = function(latitude, longitude, options, callback) {
    self.callByGeolocation('/observations.json', latitude, longitude, options, callback);
  };

  self.tendayByGeolocation = function(latitude, longitude, options, callback) {
    self.callByGeolocation('/forecast/daily/10day.json', latitude, longitude, options, callback);
  };

  self.alertsByGeolocation = function(latitude, longitude, options, callback) {
    self.callByGeolocation('/alerts.json', latitude, longitude, options, callback);
  };
}

module.exports = function(url) {
  return new Weather(url);
};
