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
const recommend = require('../actions/recommend.js');
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

describe('Recommend', () => {
  it('filters retailers on event location', (done) => {
    const event = {
      lat: 38.89,
      lon: -77.03
    };
    recommend.filterRetailers(retailers, event, (err, filtered) => {
      assert.equal(1, filtered.length);
      done(err);
    });
  });

  it('can fail during recommend', (done) => {
    // intercept the call to retrieve retailers
    nock('http://fail')
      .get('/api/v1/demos/MyGUID/retailers')
      .reply(500, []);

    // trigger a recommendation
    recommend.main({
      demoGuid: 'MyGUID',
      event: {
        lat: 38.89,
        lon: -77.03
      },
      'services.controller.url': 'http://fail'
    }).catch((err) => {
      assert.equal(false, err.ok);
      done(null);
    });
  });

  it('does recommendations', (done) => {
    // intercept the call to retrieve retailers
    nock('http://intercept')
      .get('/api/v1/demos/MyGUID/retailers')
      .reply(200, retailers);

    // intercept the call to persist recommendations
    nock('http://cloudant')
      .post('/recommendations/_bulk_docs?include_docs=true')
      .reply(200, (uri, requestBody) =>
        requestBody.docs.map((row, index) => ({
          id: (index + 1) * 100,
          rev: 0
        })));

    // trigger a recommendation
    recommend.main({
      demoGuid: 'MyGUID',
      event: {
        lat: 38.89,
        lon: -77.03,
      },
      'services.controller.url': 'http://intercept',
      'services.cloudant.url': 'http://cloudant',
      'services.cloudant.database': 'recommendations'
    }).then((result) => {
      assert.equal('MyGUID', result.demoGuid);
      assert.equal(1, result.recommendations.length);
      assert.equal(100, result.recommendations[0]._id);
      done(null);
    });
  });

  it('handles error when persisting recommendations', (done) => {
    // intercept the call to retrieve retailers
    nock('http://intercept')
      .get('/api/v1/demos/MyGUID/retailers')
      .reply(200, retailers);

    // intercept the call to persist recommendations
    nock('http://cloudant')
      .post('/recommendations/_bulk_docs?include_docs=true')
      .reply(500);

    // trigger a recommendation
    recommend.main({
      demoGuid: 'MyGUID',
      event: {
        lat: 38.89,
        lon: -77.03,
      },
      'services.controller.url': 'http://intercept',
      'services.cloudant.url': 'http://cloudant',
      'services.cloudant.database': 'recommendations'
    }).catch((result) => {
      assert.equal(false, result.ok);
      done(null);
    });
  });
});
