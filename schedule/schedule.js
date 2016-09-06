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
 * @fileoverview Library for parsing and managing schedule JSON.
 */

'use strict';

class Session {
  /**
   * @param {string} id
   * @param {!Object} data
   * @param {!Moment} when
   * @param {!Array<!Speaker>} speakers
   */
  constructor(id, data, when, speakers) {
    this.id = id;
    this.data = data;
    this.when = when;
    this.speakers = speakers;
  }

  get name() {
    return this.data['name'] || '';
  }

  get track() {
    return this.data['track'] || '';
  }

  get speakerNames() {
    return this.speakers.map(speaker => speaker.name);
  }
}

class Speaker {
  /**
   * @param {string} id
   * @param {!Object|string} data
   */
  constructor(id, data) {
    if (typeof data !== 'object') {
      data = {'name': data.toString()};
    }
    this.id = id;
    this.data = data;
  }

  get name() {
    return this.data['name'] || this.id;
  }
}

/**
 * Groups sessions by unique data, e.g. by date.
 */
class GroupManager {
  constructor(sessions) {
    this.sessions_ = sessions.slice();
    this.sessions_.sort((a, b) => a.when.diff(b.when));
  }

  /**
   * @return {!Array<!Session>} containing all sessions
   */
  get all() {
    return this.sessions_.slice();
  }

  /**
   * Executes the provided function once per session.
   * @param {function(!Session, number)} handler
   */
  forEach(handler) {
    this.sessions_.forEach(handler);
  }

  byDate(opt_handler) {
    return this.by(session => session.when.format('YYYY-MM-DD'), opt_handler);
  }

  byTrack(opt_handler) {
    return this.by(session => session.track || '', opt_handler);
  }

  by(mapper, opt_handler) {
    const raw = {};
    this.sessions_.forEach(session => {
      const v = mapper(session) || '';  // string keys always
      let l = raw[v];
      if (l === undefined) {
        raw[v] = l = [];
      }
      l.push(session);
    });

    const keys = Object.keys(raw).sort();
    const out = new Map();
    for (const key of keys) {
      out.set(key, new GroupManager(raw[key]));
    }

    if (opt_handler) {
      out.forEach((value, key) => opt_handler(key, value));
    }

    return out;
  }
}

module.exports = {
  GroupManager,
  Session,
  Speaker,
};
