const recommend = require('../actions/recommend.js');
const assert = require('chai').assert;
const nock = require('nock');

const retailers = [
  {
    "id": "201",
    "address": {
      "city": "Raleigh",
      "state": "North Carolina",
      "country": "US",
      "latitude": 35.71,
      "longitude": -78.63
    }
  },
  {
    "id": "203",
    "address": {
      "city": "San Francisco",
      "state": "California",
      "country": "US",
      "latitude": 37.72,
      "longitude": -122.44
    }
  }
];

describe('Recommend', () => {

  it('filters retailers on event location', (done) => {
    const event = {
      metadata: {
        latitude: 38.89,
        longitude: -77.03,
      }
    };
    recommend.filterRetailers(retailers, event, (err, filtered) => {
      assert.equal(1, filtered.length);
      done(err);
    });
  });

  it('does recommendations', (done) => {
    // prepare to catch calls to whisk to capture the results and validate
    global.whisk = {
      done: function(result, err) {
        assert.equal('MyGUID', result.demoGuid);
        assert.equal(1, result.recommendations.length);
        done(null);
      },
      async: function() {
        // do nothing, whisk.done should get called
      }
    };

    // intercept the call to retrieve retailers
    nock('http://intercept')
      .get('/api/v1/demos/MyGUID/retailers')
      .reply(200, retailers);

    // trigger a recommendation
    recommend.main({
      demoGuid: 'MyGUID',
      event: {
        metadata: {
          latitude: 38.89,
          longitude: -77.03
        },
      },
      "services.controller.url": 'http://intercept'
    });
  });

});
