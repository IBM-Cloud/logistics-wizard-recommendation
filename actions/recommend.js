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
const Cloudant = require('cloudant');

/**
 * OpenWhisk entry point.
 *
 * @param {Object} args Expected arguments:
 * <li> {string} demoGuid - the demo environment to use
 * <li> {Object} event - the weather event to analyze
 * <li> {string} services.controller.url - URL to the controller service
 * <li> {string} services.cloudant.url - URL to the Cloudant service
 * <li> {string} services.cloudant.database - Database to store recommendations
 * @returns {Object}
 * <li> {string} demoGuid
 * <li> {Object} event
 * <li> {Object[]} recommendations
 */
function main(args) {
  console.log('New weather event for demo', args.demoGuid,
    'at latitude', args.event.lat,
    'and longitude', args.event.lon);

  return new Promise((resolve, reject) => {
    async.waterfall([
      // retrieve list of retailers
      function(callback) {
        getRetailers(args['services.controller.url'],
          args.demoGuid, callback);
      },
      // identify retailers affected by the weather event
      function(retailers, callback) {
        console.log('args.event: ....', args.event);
        filterRetailers(retailers, args.event, callback);
      },
      // retrieve their stock and make new shipments
      function(retailers, callback) {
        recommend(retailers, callback);
      },
      // persist the recommendations
      function(recommendations, callback) {
        persist(
          args['services.cloudant.url'],
          args['services.cloudant.database'],
          args.demoGuid,
          recommendations,
          callback);
      }
    ], (err, result) => {
      if (err) {
        console.log('[KO]', err);
        reject({ ok: false });
      } else {
        console.log('[OK] Got', result.length, 'recommendations');
        resolve({
          demoGuid: args.demoGuid,
          event: args.event,
          recommendations: result,
        });
      }
    });
  });
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
    if (response.statusCode === 200) {
      const retailLocations = body;
      console.log(`Got ${retailLocations.length} retailLocations.`);
      callback(null, retailLocations);
    } else {
      console.log('getRetailers ERROR', error, response.statusCode);
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
    event.lat,
    event.lon);

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
      toId: retailer.id
    };
    recommendations.push(recommendation);
  });

  callback(null, recommendations);
}
exports.recommend = recommend;

/**
 * Persists the recommendations.
 *
 * @param {string} cloudantUrl
 * @param {string} cloudantDatabase
 * @param {string} demoGuid
 * @param {Object[]} recommendations
 * @param callback - err, persisted recommendations
 */
function persist(cloudantUrl, cloudantDatabase, demoGuid, recommendations, callback) {
  console.log('Persisting', recommendations.length, 'recommendations...');
  const cloudant = Cloudant({
    url: cloudantUrl,
    plugin: 'retry',
    retryAttempts: 5,
    retryTimeout: 500
  });

  const records = recommendations.map(reco => ({
    guid: demoGuid, recommendation: reco }));
  const db = cloudant.use(cloudantDatabase);
  db.bulk({ docs: records }, { include_docs: true }, (bulkErr, result) => {
    if (bulkErr) {
      callback(bulkErr);
    } else {
      // inject the cloudant IDs into the recommendations
      result.forEach((doc, index) => {
        recommendations[index]._id = doc.id;
      });
      callback(null, recommendations);
    }
  });
}
exports.persist = persist;
