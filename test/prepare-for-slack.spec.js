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
const prepareForSlack = require('../actions/prepare-for-slack.js').main;
const assert = require('chai').assert;
const nock = require('nock');

describe('Prepare For Slack', () => {
  it('formats recommendations', (done) => {
    nock('http://cloudant')
      .get('/recommendations/123')
      .reply(200, {
        recommendation: {
          status: 'NEW',
          fromId: '100',
          toId: '200'
        }
      });

    prepareForSlack({
      id: '123',
      changes: [
        {
          rev: '1-123456'
        }
      ],
      'services.cloudant.url': 'http://cloudant',
      'services.cloudant.database': 'recommendations'
    }).then((result) => {
      assert(result.text.length > 0, 'No text found!');
      done(null);
    });
  });

  it('ignores subsequent updates', (done) => {
    const result = prepareForSlack({
      id: '123',
      changes: [
        {
          rev: '2-123456',
        }
      ]
    });
    assert(result.error, 'an error should have been detected');
    done(null);
  });

  it('ignores delete events', (done) => {
    const result = prepareForSlack({
      id: '123',
      changes: [
        {
          rev: '1-123456',
        }
      ],
      deleted: true
    });
    assert(result.error, 'an error should have been detected');
    done(null);
  });
});
