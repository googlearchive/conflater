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

/**
 * @param {!GroupManager} schedule object
 * @param {!Handlebars} handlebars scope
 * @param {function(!Object, string, string=)} emit helper for view, template path and output path
 */
module.exports = function(schedule, handlebars, emit) {
  handlebars.registerHelper('toISO', m => {
    return m.toISOString();
  });
  handlebars.registerHelper('time', m => {
    return m.format('hh:mm');
  });
  handlebars.registerHelper('datetime', m => {
    return m.format('YYYY-MM-DD hh:mm');
  });

  schedule.forEach(session => {
    emit(session, 'templates/session.html', `session_${session['id']}`);
  });

  emit(schedule.all, 'templates/schedule.html');

};
