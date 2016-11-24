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
 * @module retrieve
 */
const Cloudant = require('cloudant');

/**
 * OpenWhisk entry point.
 *
 * @param {Object} args Expected arguments:
 * <li> {string} demoGuid - the demo environment to use
 * <li> {string} services.cloudant.url - URL to the Cloudant service
 * <li> {string} services.cloudant.database - Database where recommendations are stored
 * @returns {Object}
 * <li> {Object[]} recommendations
 */
function main(args) {
  console.log('Retrieve recommendations for demo', args.demoGuid);

  return new Promise((resolve, reject) => {
    retrieve(
      args['services.cloudant.url'],
      args['services.cloudant.database'],
      args.demoGuid,
      (err, result) => {
        if (err) {
          console.log('[KO]', err);
          reject({ ok: false });
        } else {
          console.log('[OK] Got', result.length, 'recommendations');
          resolve({ recommendations: result });
        }
      }
    );
  });
}
exports.main = global.main = main;

/**
 * Retrieves recommendations linked to a given demo
 * <li> {string} cloudantUrl - URL to the Cloudant service
 * <li> {string} cloudantDatabase - Database where recommendations are stored
 * <li> {string} demoGuid
 * <li> callback - err, recommendations
 */
function retrieve(cloudantUrl, cloudantDatabase, demoGuid, callback) {
  console.log('Searching index...');
  const cloudant = Cloudant({
    url: cloudantUrl,
    plugin: 'retry',
    retryAttempts: 5,
    retryTimeout: 500
  });

  const db = cloudant.db.use(cloudantDatabase);
  db.search('recommendations', 'byGuid',
    { q: `guid:${demoGuid}`, include_docs: true }, (err, result) => {
      if (err) {
        callback(err);
      } else {
        callback(null, result.rows.map((row) => {
          // remap the recommendation object
          // to make it look like what we returned in recommend.js
          const recommendation = row.doc.recommendation;
          recommendation._id = row.doc._id;
          return recommendation;
        }));
      }
    });
}
exports.retrieve = retrieve;
