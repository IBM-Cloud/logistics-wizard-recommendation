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

const async = require('async');
const GeoPoint = require('geopoint');

/**
 * @param demoGuid - the demo environment to use
 * @param accessToken - the token to use to access the controller service API
 * @param event - the weather event to analyze
 * @param services.controller.url - URL to the controller service
 */
exports.main = global.main = (args) => {
  console.log('New weather event for demo', args.demoGuid,
    'at latitude', args.event.metadata.latitude,
    'and longitude', args.event.metadata.longitude);

  async.waterfall([
    // retrieve list of retailers
    function(callback) {
      getRetailers(args['services.controller.url'],
        args.demoGuid, args.accessToken, callback);
    },
    // identify retailers affected by the weather event
    function(retailers, callback) {
      filterRetailers(retailers, args.event, callback);
    },
    // retrieve their stock and make new shipments
    function(retailers, callback) {
      recommend(retailers, callback);
    },
  ], (err, result) => {
    if (err) {
      console.log('[KO]', err);
      whisk.done(null, err);
    } else {
      console.log('[OK] Got', result.length, 'recommendations');
      whisk.done({
        guid: args.guid,
        event: args.event,
        recommendations: result,
      });
    }
  });
};

function getRetailers(controllerUrl, demoGuid, accessToken, callback) {
  // const url = `${controllerUrl}/api/v1/demos/${token}/retailers`;
  console.log('Retrieving retailers...');
  callback(null, []);
}
exports.getRetailers = getRetailers;

/**
 * Filter retailers based on the weather event
 */
function filterRetailers(retailers, event, callback) {
  console.log('Filtering retailers...');

  const filtered = [];
  const stormLocation = new GeoPoint(
    event.metadata.latitude,
    event.metadata.longitude);

  retailers.forEach((retailer) => {
    // get gps coordinate
    const retailLocation = new GeoPoint(retailer.address.latitude, retailer.address.longitude);

    // calculate distance
    const distance = retailLocation.distanceTo(stormLocation, true);
    console.log('Distance between', retailer.address.city, 'and event is', distance);

    // if its within 800km
    if (distance < 800) {
      console.log(`Affected Location: ${retailer.address.city}`);
      filtered.push(retailer);
    }
  });

  callback(null, filtered);
}
exports.filterRetailers = filterRetailers;

function recommend(retailers, callback) {
  console.log('Making recommendations...');
  callback(null, []);
}
exports.recommend = recommend;
