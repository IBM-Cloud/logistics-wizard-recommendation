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
 * @module recommend
 */
const async = require('async');
const request = require('request');
const GeoPoint = require('geopoint');

/**
 * OpenWhisk entry point.
 *
 * @param {Object} args Expected arguments:
 * <li> {string} demoGuid - the demo environment to use
 * <li> {string} accessToken - the token to use to access the controller service API
 * <li> {Object} event - the weather event to analyze
 * <li> {string} services.controller.url - URL to the controller service
 * @returns {Object}
 * <li> {string} demoGuid
 * <li> {Object} event
 * <li> {Object[]} recommendations
 */
function main(args) {
  console.log('New weather event for demo', args.demoGuid,
    'at latitude', args.event.metadata.latitude,
    'and longitude', args.event.metadata.longitude);

  async.waterfall([
    // retrieve list of retailers
    function(callback) {
      getRetailers(args['services.controller.url'],
        args.demoGuid, callback);
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
        demoGuid: args.demoGuid,
        event: args.event,
        recommendations: result,
      });
    }
  });

  return whisk.async();
}
exports.main = global.main = main;

/**
 * Returns the list of retailers in the given demo.
 * @param callback err, retailers
 */
function getRetailers(controllerUrl, demoGuid, callback) {
  const retailerUrl = `${controllerUrl}/api/v1/demos/${demoGuid}/retailers`;
  console.log(`Retrieving retailers... ${retailerUrl}`);
  request.get({ url: retailerUrl, json: true }, (error, response, body) => {
    if (error) {
      console.log('getRetailers ERROR', error);
      callback(error);
    } else if (response.statusCode === 200) {
      const retailLocations = body;
      console.log(`Got ${retailLocations.length} retailLocations.`);
      callback(null, retailLocations);
    } else {
      console.log('getRetailers ERROR', response.statusCode);
      callback({ error: response.statusCode });
    }
  });
}
exports.getRetailers = getRetailers;

/**
 * Filters retailers based on the weather event
 *
 * @param {Object[]} retailers
 * @param {Object} event
 * @param callback - err, filtered retailers
 */
function filterRetailers(retailers, event, callback) {
  console.log('Filtering retailers...');

  const filtered = [];
  const stormLocation = new GeoPoint(
    event.metadata.latitude,
    event.metadata.longitude);

  retailers.forEach((retailer) => {
    // get gps coordinate
    console.log('Looking at', retailer.address.city);
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

/**
 * Generates recommendation for the given retails.
 *
 * @param {Object[]} retailers
 * @param callback - err, recommendations
 */
function recommend(retailers, callback) {
  console.log('Making recommendations...');
  const recommendations = [];
  retailers.forEach((retailer) => {
    const recommendation = {
      status: 'NEW',
      estimatedTimeOfArrival: '2016-10-16T00:00:00.000Z',
      fromId: 1,
      toId: retailer.id,
      id: Math.floor((Math.random() * 1000) + 1)
    };
    recommendations.push(recommendation);
  });

  callback(null, recommendations);
}
exports.recommend = recommend;
