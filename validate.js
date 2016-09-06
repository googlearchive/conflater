#!/usr/bin/env node
/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

if (module.parent) {
  throw new Error('validate.js should not be used in require()');
}

const Table = require('cli-table');
const colors = require('colors/safe');
const moment = require('moment');

function createOutput(audits) {
  const codes = [colors.red('✘'), colors.yellow('?'), colors.green('✓')];

  function format(audit) {
    const message = audit.message + (audit.path ? ` ${colors.yellow(audit.path)}` : '');

    if (typeof audit.status == 'number') {
      const code = codes[Math.sign(audit.status) + 1];
      return `${code} ${message}\n`;
    }
    return `  ${message}\n`;
  };

  return audits.map(format).join('');
}

const audits = [];
function log(status, message, path) {
  audits.push({status, message, path});
}

function loadJSON(path='schedule.json') {
  const fs = require('fs');
  let scheduleData;
  try {
    scheduleData = fs.readFileSync(path).toString();
  } catch (e) {
    log(-1, `Couldn't load schedule file`);
    return {};
  }

  let x = {};
  try {
    eval(`x = ${scheduleData};`);
    try {
      JSON.parse(scheduleData);
      log(+1, `Schedule is valid JSON`);
    } catch (e) {
      log(0, `Schedule can be parsed, but is not valid JSON`);
    }
  } catch (e) {
    log(-1, `Unable to parse schedule data: ${e}`);
  }

  return x;
}

const json = loadJSON();
const parser = require('./schedule/parser');
const schedule = parser(json, log);

process.stdout.write(createOutput(audits));

/**
 * Helper class to build a table for sessions on a single day.
 */
class DayTableBuilder {
  constructor() {
    this.trackNames = {};
    this.times = {};
  }

  static arrayOf(v, size) {
    return new Array(size).fill(v);
  }

  add(session) {
    const when = session.when.format('hh:mm');

    // Record this session at the specified time...
    let all = this.times[when];
    if (!all) {
      all = [];
      this.times[when] = all;
    }
    all.push(session);

    // And log its track name.
    this.trackNames[session.track || ''] = 0;
  }

  render(width=process.stdout.columns) {
    const trackNames = Object.keys(this.trackNames).sort();
    trackNames.forEach((name, i) => {
      this.trackNames[name] = i;  // store its position in the array
    });
    const trackWidth = Math.floor((width - 9) / trackNames.length) - 1;

    // TODO: Show end times if they don't line up with the next slot, or eat into the next slot
    // (needs cli-table2)
    const t = new Table({
      head: ['When'].concat(trackNames),
      colWidths: [7].concat(new Array(trackNames.length).fill(trackWidth)),
    });

    // Sort unique times, and create events starting then in the right column.
    const times = Object.keys(this.times).sort();
    times.forEach(time => {
      const rows = {};
      trackNames.forEach(name => rows[name] = []);

      // For each event, add data to that cell.
      this.times[time].forEach(session => {
        rows[session.track || ''].push(...DayTableBuilder.textForSession(session));
      });

      // For each cell, filter empty lines, and join by newline to create each row.
      const row = [time];
      trackNames.forEach(name => {
        const line = rows[name].filter(x => !!x).join('\n');
        row.push(line);
      });
      t.push(row);
    });

    return t.toString();
  }

  /**
   * @param {!Session} s
   * @return {!Array<string>}
   */
  static textForSession(s) {
    const out = [s.name];
    if (s.speakers.length) {
      // TODO: cli-table can't handle control characters for length
      out.push(`${colors.yellow(s.speakerNames.join(', '))}`);
    }
    // out.push(s.data['abstract']);
    return out;
  }
}

schedule.byDate((date, sessions) => {
  const m = moment(date);
  const b = new DayTableBuilder();
  sessions.forEach(session => b.add(session));

  console.info(`\n ${m.format('ddd YYYY-MM-DD')}\n${b.render()}`);
});


