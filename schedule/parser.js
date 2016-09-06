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

/**
 * @fileoverview Core parser for the `schedule.json` format.
 */

const moment = require('moment');
const momentTZ = require('moment-timezone');  // not used, just for side-effects
const IdManager = require('./id');
const walk = require('./walk');
const {GroupManager, Session, Speaker} = require('./schedule')

class ParserError extends Error {}

/**
 * Parses a raw schedule, assuming input is JSON data. The format is described in the SCHEDULE.md
 * file at the top-level of this repository.
 *
 * This method exists to deal with a variety of conference layouts as scheduled in the source JSON,
 * and smooths over challenges such as timezones.
 *
 * @param {{speakers, sessions, config}} schedule
 * @param {function(number, string)} logger
 * @return {!GroupManager}
 */
module.exports = function parser(schedule, logger) {
  const ids = new IdManager();
  const config = schedule['config'] || {};

  const zone = moment.tz.zone(config['timezone']);
  if (!zone) {
    if (config['timezone']) {
      throw new ParserError(`Unknown timezone: ${config['timezone']}`);
    }
    throw new ParserError(`Unspecified timezone, see schedule format`);
  }
  logger(1, `Using timezone: ${zone.name}`);

  const speakers = {};
  for (let id in (schedule['speakers'] || {})) {
    ids.must(id);
    speakers[id] = new Speaker(id, schedule['speakers'][id]);
  }

  const sessions = walk(schedule['sessions']).map(tree => {
    const raw = {};
    const candidateIds = [];
    let lastPath;

    const expected = 'when sessions id name speakers abstract process track'.split(' ');

    tree.forEach((value, path) => {
      const lastSegment = path[path.length - 1];
      candidateIds.unshift(lastSegment, value['id'], value['name']);

      for (const k in value) {
        if (!expected.includes(k)) {
          logger(0, `Unknown field`, `sessions/${path.join('/')}/${k}`);
        } else if (k != 'id' && k != 'sessions') {
          raw[k] = value[k];
        }
      }

      lastPath = path;
    });

    const speakersForSession = (raw['speakers'] || []).map(data => {
      if (typeof data === 'string' && data in speakers) {
        // this ID matches a known speaker
        return speakers[data];
      }
      const id = ids.alloc(data);
      speakers[id] = new Speaker(id, data);
      return speakers[id];
    });

    const id = ids.alloc(...candidateIds);
    const when = moment.tz(raw['when'], zone.name);

    const path = 'sessions/' + lastPath.join('/');
    if (!raw['name']) {
      logger(0, `Ignoring session with empty name`, path);
      return null;
    }
    if (!raw['when'] || !when.isValid()) {
      logger(-1, `Invalid date; ignoring session: ${raw['when']}`, path);
      return null;
    }

    return new Session(id, raw, when, speakersForSession);
  }).filter(session => session != null);

  const gm = new GroupManager(sessions);
  logger(+1, `Found ${sessions.length} sessions on ${gm.byDate().size} days`);
  return gm;
};
