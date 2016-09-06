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

const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

module.exports = function(grouper, generator) {
  const scope = handlebars.create();
  const rules = {};
  const templates = {};

  generator(grouper, scope, (view, template, output=null) => {
    if (!template) {
      throw new TypeError(`invalid template for view: ${view}`);
    }

    output = output || path.basename(template);  // fallback to template name
    if (!output.endsWith('.html')) { output += '.html'; }
    if (output in rules) {
      throw new TypeError(`duplicate output path: ${output}`);
    }

    if (!(template in templates)) {
      templates[template] = scope.compile(fs.readFileSync(template, 'UTF-8'));
    }
    rules[output] = {view, content: templates[template]};
  });

  const rendered = {};
  for (const output in rules) {
    const rule = rules[output];
    const scope = {view: rule.view};

    const source = rule.content(scope, {});

    rendered[output] = source;
  }

  return rendered;
};
