const recommend = require('../recommend.js').main;
const assert = require('chai').assert;

describe('Recommend', () => {
  it('does recommendations', (done) => {

    // prepare to catch calls to whisk to capture the results and validate
    global.whisk = {
      done: function(result, err) {
        assert.equal('MyGUID', result.guid);
        assert.equal(0, result.recommendations.length);
        done(null);
      }
    };

    recommend({
      guid: 'MyGUID',
      event: {
        metadata: {
          latitude: 45.0,
          longitude: -110.5,
        },
      },
    });

  });

});
