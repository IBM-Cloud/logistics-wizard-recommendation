const acknowledge = require('../actions/acknowledge.js').main;
const assert = require('chai').assert;

describe('Acknowledge', () => {
  it('acknowledges recommendations', (done) => {

    // prepare to catch calls to whisk to capture the results and validate
    global.whisk = {
      done: function(result, err) {
        assert.equal('MyGUID', result.demoGuid);
        done(null);
      }
    };

    acknowledge({
      demoGuid: 'MyGUID',
      recommendations: [],
    });

  });

});
