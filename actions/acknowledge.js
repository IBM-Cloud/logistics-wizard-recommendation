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
 * @module acknowledge
 */
const Cloudant = require('cloudant');

/**
 * OpenWhisk entry point.
 *
 * @param {Object} args Expected arguments:
 * <li> {string} demoGuid - the demo environment to use
 * <li> {string} recommendationId - the recommendation ID to acknowledge
 * <li> {string} recommendationRev - the recommendation Rev to acknowledge
 * <li> {string} services.cloudant.url - URL to the Cloudant service
 * <li> {string} services.cloudant.database - Database where recommendations are stored
 * @returns {Object}
 * <li> {boolean} "ok"
 */
function main(args) {
  console.log('Acknowledge for demo', args.demoGuid,
    'and recommendation', args.recommendationId);

  return new Promise((resolve, reject) => {
    acknowledge(
      args['services.cloudant.url'],
      args['services.cloudant.database'],
      args.demoGuid,
      args.recommendationId,
      args.recommendationRev,
      (err) => {
        if (err) {
          console.log('[KO]', err);
          reject({ ok: false });
        } else {
          console.log('[OK] Recommendation', args.recommendationId, 'acknowledged');
          resolve({ ok: true });
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
function acknowledge(cloudantUrl, cloudantDatabase,
  demoGuid, recommendationId, recommendationRev, callback) {
  console.log('Deleting recommendation...');
  const cloudant = Cloudant({
    url: cloudantUrl,
    plugin: 'retry',
    retryAttempts: 5,
    retryTimeout: 500
  });

  const db = cloudant.db.use(cloudantDatabase);
  db.destroy(recommendationId, recommendationRev, (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}
exports.acknowledge = acknowledge;
