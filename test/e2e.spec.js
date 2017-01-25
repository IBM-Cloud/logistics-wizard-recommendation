/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
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
const recommend = require('../actions/recommend.js').main;
const retrieve = require('../actions/retrieve.js').main;
const assert = require('chai').assert;
const nock = require('nock');

const retailers = [
  {
    id: '201',
    address: {
      city: 'Raleigh',
      state: 'North Carolina',
      country: 'US',
      latitude: 35.71,
      longitude: -78.63
    }
  },
  {
    id: '203',
    address: {
      city: 'San Francisco',
      state: 'California',
      country: 'US',
      latitude: 37.72,
      longitude: -122.44
    }
  }
];

describe('End to End Tests', () => {
  it('clears up recommendations between two simulations for the same demo', (done) => {
    // trigger a recommendation
    nock('http://intercept')
      .get('/api/v1/demos/MyGUID/retailers')
      .reply(200, retailers);
    nock('http://cloudant')
      .get('/recommendations/_design/recommendations/_search/byGuid?q=guid%3AMyGUID&include_docs=true')
      .reply(200, {
        total_rows: 0,
        rows: []
      })
      .post('/recommendations/_bulk_docs?include_docs=true')
      .reply(200, (uri, requestBody) =>
        requestBody.docs.map((row, index) => ({
          id: (index + 1) * 100,
          rev: 0
        })));
    recommend({
      demoGuid: 'MyGUID',
      event: {
        lat: 38.89,
        lon: -77.03,
        radiusInKm: 800
      },
      'services.controller.url': 'http://intercept',
      'services.cloudant.url': 'http://cloudant',
      'services.cloudant.database': 'recommendations'
    })
    .then((result) => {
      console.log(result.recommendations[0]);
      assert.equal('MyGUID', result.demoGuid);
      assert.equal(1, result.recommendations.length);
      assert.equal(100, result.recommendations[0]._id);
    })
    .then(() => {
      // retrieve recommendations
      nock('http://cloudant')
        .get('/recommendations/_design/recommendations/_search/byGuid?q=guid%3AMyGUID&include_docs=true')
        .reply(200, {
          rows: [
            {
              doc: {
                _id: 100,
                _rev: 0,
                recommendation: {
                  status: 'NEW',
                  estimatedTimeOfArrival: '2016-10-16T00:00:00.000Z',
                  fromId: 1,
                  toId: '201'
                }
              }
            },
          ]
        });
      return retrieve({
        demoGuid: 'MyGUID',
        'services.cloudant.url': 'http://cloudant',
        'services.cloudant.database': 'recommendations'
      });
    })
    .then((result) => {
      assert.equal(1, result.recommendations.length);
    })
    .then(() => {
      // run another simulation
      nock('http://intercept')
        .get('/api/v1/demos/MyGUID/retailers')
        .reply(200, retailers);
      nock('http://cloudant')
        .get('/recommendations/_design/recommendations/_search/byGuid?q=guid%3AMyGUID&include_docs=true')
        .reply(200, {
          total_rows: 0,
          rows: [{
            doc: {
              _id: 100,
              _rev: 0,
              recommendation: {
                status: 'NEW',
                estimatedTimeOfArrival: '2016-10-16T00:00:00.000Z',
                fromId: 1,
                toId: '201'
              }
            }
          }]
        })
        .post('/recommendations/_bulk_docs') // the call to delete
        .reply(200, (uri, requestBody) => {
          assert.equal(1, requestBody.docs.length);
          assert.equal(true, requestBody.docs[0]._deleted);
          return {};
        })
        .post('/recommendations/_bulk_docs?include_docs=true')
        .reply(200, (uri, requestBody) =>
          requestBody.docs.map((row, index) => ({
            id: (index + 1) * 100,
            rev: 0
          })));

      return recommend({
        demoGuid: 'MyGUID',
        event: {
          lat: 38.89,
          lon: -77.03,
          radiusInKm: 800
        },
        'services.controller.url': 'http://intercept',
        'services.cloudant.url': 'http://cloudant',
        'services.cloudant.database': 'recommendations'
      });
    })
    .then(() => {
      // retrieve recommendations again
      nock('http://cloudant')
        .get('/recommendations/_design/recommendations/_search/byGuid?q=guid%3AMyGUID&include_docs=true')
        .reply(200, {
          rows: [
            {
              doc: {
                _id: 110,
                _rev: 0,
                recommendation: {
                  status: 'NEW',
                  estimatedTimeOfArrival: '2016-10-16T00:00:00.000Z',
                  fromId: 1,
                  toId: '201'
                }
              }
            },
          ]
        });
      return retrieve({
        demoGuid: 'MyGUID',
        'services.cloudant.url': 'http://cloudant',
        'services.cloudant.database': 'recommendations'
      });
    })
    .then((result) => {
      assert.equal(1, result.recommendations.length);
    })
    .then(() => {
      done(null);
    });
  });
});
