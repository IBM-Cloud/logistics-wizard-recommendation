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
const observations = require('../actions/observations.js');
const assert = require('chai').assert;
const nock = require('nock');

describe('Observations', () => {
  it('tell the weather', (done) => {
    // mock the call to the Weather service
    nock('http://theweatherservice')
      .get(/observations.json/)
      .reply(200, { observation: {weather: 'good'} })
      .get(/10day.json/)
      .reply(200, { forecasts: [{forecast: 'good'}] })
      .get(/alerts.json/)
      .reply(200, { alerts: [{alert: 'none'}] })

    observations.main({
      'services.weather.url': 'http://theweatherservice',
      latitude: 38.89,
      longitude: -77.03
    }).then(result => {
      assert.equal(result.observation.weather, 'good');
      assert.equal(result.forecasts.length, 1);
      assert.equal(result.forecasts[0].forecast, 'good');
      assert.equal(result.alerts.length, 1);
      assert.equal(result.alerts[0].alert, 'none');
      done(null);
    });
  });

});
