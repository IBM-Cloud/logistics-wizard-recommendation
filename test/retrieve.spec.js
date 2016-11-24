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
const retrieve = require('../actions/retrieve.js').main;
const assert = require('chai').assert;
const nock = require('nock');

describe('Retrieve', () => {
  it('returns existing recommendations', (done) => {
    nock('http://cloudant')
      .post('/recommendations')
      .reply(200, '{"ok":true}')
      .get('/recommendations/_design/recommendations/_search/byGuid?q=guid%3AMyGUID&include_docs=true')
      .reply(200, {
        rows: [
          {
            doc: {
              _id: 0,
              _rev: 0,
              recommendation: {
                fromId: 10,
                toId: 20
              }
            }
          },
          {
            doc: {
              _id: 1,
              _rev: 0,
              recommendation: {
                fromId: 30,
                toId: 40
              }
            }
          }
        ]
      });

    retrieve({
      demoGuid: 'MyGUID',
      'services.cloudant.url': 'http://cloudant',
      'services.cloudant.database': 'recommendations'
    }).then(result => {
      assert.equal(2, result.recommendations.length);
      assert.equal(0, result.recommendations[0]._id);
      assert.equal(1, result.recommendations[1]._id);
      assert.equal(10, result.recommendations[0].fromId);
      assert.equal(40, result.recommendations[1].toId);
      done(null);
    })
  });
});
