const retrieve = require('../actions/retrieve.js').main;
const assert = require('chai').assert;

describe('Retrieve', () => {
  it('returns existing recommendations', (done) => {

    // prepare to catch calls to whisk to capture the results and validate
    global.whisk = {
      done: function(result, err) {
        assert.equal('MyGUID', result.guid);
        assert.equal(0, result.recommendations.length);
        done(null);
      }
    };

    retrieve({
      guid: 'MyGUID',
    });

  });

});
