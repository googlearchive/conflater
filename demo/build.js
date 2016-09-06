#!/usr/bin/env node
/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

const fs = require('fs');
console.warn('build.js: invoking demo generator');

// Parse the demo schedule.json file.
const parser = require('../schedule/parser');
const schedule = parser(require('../schedule.json'), (status, message) => {
  if (status <= 0) {
    throw new Error('parser error: ' + message);
  }
});

// Load our demo rules.
const rules = require('./rules');

// Run the build pass, with the given set of rules.
const build = require('../build');
const output = build(schedule, rules);

// Write the output files to dist/.
for (const p in output) {
  try {
    fs.mkdirSync('dist');
  } catch (e) {
    // ignore
  }
  console.info('dist/' + p);
  fs.writeFileSync('dist/' + p, output[p]);
}
