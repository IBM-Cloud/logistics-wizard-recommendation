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
 const request = require('request');
 const geolib = require('geolib');

 exports.main = global.main = (args) => {
   console.log('New weather event for demo', args.guid, 'at latitude',
    args.event.metadata.latitude, 'and longitude', args.event.metadata.longitude);

   const token = args.token;
   const stormLatitude = args.event.metadata.latitude || 38.89;
   const stormLongitude = args.event.metadata.latitude || -77.03;
   const url = `https://dev-logistics-wizard-controller.mybluemix.net/api/v1/demos/${token}/retailers`;
    // console.log(url);

   const stormLocation = { latitude: stormLatitude, longitude: stormLongitude };

   const recommendations = [];

  // get all retail locations from API
   return new Promise((resolve, reject) => {
     request.get(url, (error, response, body) => {
       if (error) {
         reject(error);
       } else {
         const retailLocations = JSON.parse(body);

          // loop thru retail locations
         retailLocations.forEach((rl) => {
            // get gps coordinate
           const retailLocation = { latitude: rl.address.latitude, longitude: rl.address.longitude };
            // console.log(retailLocation);

            // calculate distance
           const distance = geolib.getDistance(stormLocation, retailLocation);

            // console.log(stormLocation);
            // console.log(retailLocation);
            // console.log(distance);

            // if its within 800km
           if (distance < 800000) {
             console.log(`Affected Location: ${rl.address.city}`);
             recommendations.push(rl);
           }
           // console.log(distance);
         });

         whisk.done({
           guid: args.guid,
           event: args.event,
           recommendations: [],
         });

          // generate recommendation
         resolve({ msg: body });
       }
     });
   });
 };
