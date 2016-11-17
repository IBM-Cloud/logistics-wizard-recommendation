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

/**
 * @module retrieve
 */

/**
 * OpenWhisk entry point.
 *
 * @param {Object} args Expected arguments:
 * <li> {string} demoGuid - the demo environment to use
 * @returns {Object}
 * <li> {string} demoGuid
 * <li> {Object[]} recommendations
 */
function main(args) {
  console.log('Retrieve recommendations for demo', args.demoGuid);

  whisk.done({
    demoGuid: args.demoGuid,
    recommendations: [],
  });
}
exports.main = global.main = main;
