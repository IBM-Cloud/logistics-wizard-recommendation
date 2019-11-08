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
 * @module notify
 */
const Cloudant = require('@cloudant/cloudant');

const self = exports;

/**
 * Receives Cloudant change events and generates a message suitable for Slack
 *
 * @param {Object} args Expected arguments:
 * <li> {string} doc - the Cloudant change event
 * <li> {string} doc['services.cloudant.url'] - URL to the Cloudant service
 * <li> {string} doc['services.cloudant.database'] - Database where recommendations are stored
 * @returns {Object}
 * <li> {string} text - a message to use in notifications
 */
function main(doc) {
  if (!doc.deleted && doc.changes[0].rev.startsWith('1-')) {
    // get the document from the db
    return new Promise((resolve, reject) => {
      self.makeMessage(
        doc['services.cloudant.url'],
        doc['services.cloudant.database'],
        doc.id, (err, result) => {
          if (err) {
            console.log('[KO]', err);
            reject({ error: err });
          } else {
            console.log('[OK] Text is', result.text);
            resolve(result);
          }
        }
      );
    });
  }

  return { error: 'ignoring doc' };
}
exports.main = global.main = main;

/**
 * Makes a message out of the recommendation
 *
 * <li> {string} cloudantUrl - URL to the Cloudant service
 * <li> {string} cloudantDatabase - Database where recommendations are stored
 * <li> {string} recommendationId
 * <li> callback - err, document
 */
function makeMessage(cloudantUrl, cloudantDatabase, recommendationId, callback) {
  console.log('Searching index for recommendation...', cloudantUrl, cloudantDatabase, recommendationId);
  const cloudant = Cloudant({
    url: cloudantUrl,
    plugins: {
      retry: {
        retryStatusCodes: [ 429 ],
      }
    }
  });

  const db = cloudant.db.use(cloudantDatabase);
  db.get(recommendationId, (err, doc) => {
    if (err) {
      callback(err);
    } else if (doc.recommendation) {
      callback(null, { text: `${doc.recommendation.status} shipment from ${doc.recommendation.fromId} to ${doc.recommendation.toId}` });
    } else {
      callback('not a recommendation document');
    }
  });
}
exports.makeMessage = makeMessage;
