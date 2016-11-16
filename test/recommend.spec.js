const recommend = require('../actions/recommend.js');
const assert = require('chai').assert;

describe('Recommend', () => {

  it('filters retailers on event location', (done) => {
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
        assert.equal(0, result.recommendations.length);
        done(null);
      }
    };

    recommend.main({
      demoGuid: 'MyGUID',
      event: {
        metadata: {
          latitude: 45.0,
          longitude: -110.5,
        },
      },
    });
  });

});
