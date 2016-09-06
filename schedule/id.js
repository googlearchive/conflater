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
 * @fileoverview Helper for generating schedule IDs.
 */

'use strict';

/**
 * @param {string} id to flatten
 * @param {string} sep to use to join ID
 * @return {string} flattened ID
 */
function flattenId(id, sep) {
  return id.toLowerCase().replace(/[^\w\s]/g, '').trim().replace(/\s+/g, sep);
}

/**
 * typedef {(string|{
 *   name: (string|undefined),
 *   id: (string|undefined)
 * }}
 */
const IdOpt = null;

module.exports = class IdManager {
  constructor(sep='-', join='_', fallback='unknown') {
    this.sep_ = sep;
    this.join_ = join;
    this.fallback_ = fallback;
    this.all_ = {};
  }

  /**
   * @param {string} id that must be set
   * @return {string} chosen ID
   */
  must(id) {
    if (id in this.all_) {
      throw new TypeError(`id already taken: ${id}`);
    }
    this.all_[id] = true;
    return id;
  }

  /**
   * @param {...IdOpt} opts to try for creating an ID
   * @return {string} chosen ID
   */
  alloc(...opts) {
    let cands = [];
    opts.forEach(opt => {
      if (typeof opt === 'object') {
        cands.push(opt['id'], opt['name']);
      }
      cands.push(opt);
    });

    cands = cands.filter(opt => typeof opt == 'string');
    if (!cands.length) { cands = [this.fallback_]; }  // use fallback if no valid ids here

    const parts = [];
    let candidate;
    for (const opt of cands) {
      const part = flattenId(opt, this.sep_);
      if (!part) { continue; }

      parts.push(part);
      candidate = parts.join(this.sep_);

      if (!(candidate in this.all_)) {
        this.all_[candidate] = true;
        return candidate;
      }
    }

    // If all else fails, add 0, 1, 2 ... to the end.
    const failsafe = parts.join(this.join_);
    for (let suffix = 0; candidate = failsafe + suffix; ++suffix) {
      if (!(candidate in this.all_)) {
        this.all_[candidate] = true;
        return candidate;
      }
    }
  }

};
