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
 * @fileoverview Helper for walking schedule contents.
 */

'use strict';

class Link {
  constructor(parent, id, value) {
    this.parent = parent;
    this.id = id;
    this.value = value;
  }

  /**
   * @param {!Object} sub of object or array
   * @return {!Array<!Link>} child links for elements in sub
   */
  allOf(sub) {
    const out = [];

    if (sub instanceof Array || ('length' in sub && sub.forEach)) {
      sub.forEach((v, k) => {
        out.push(new Link(this, k, v));
      });
    } else {
      for (const k in sub) {  // nb. generates string keys even for arrays
        const v = sub[k];
        out.push(new Link(this, k, v));
      }
    }

    return out;
  }

  /**
   * @return {!Map<!Array<string>, !Object>}
   */
  flat() {
    const chain = [];
    for (let curr = this; curr.parent; curr = curr.parent) {
      chain.unshift(curr);
    }

    const m = new Map();
    const id = [];
    chain.forEach(link => {
      id.push(link.id);
      m.set(id.slice(), link.value);
    });
    return m;
  }
}


/**
 * @param {!Object} root to walk
 * @param {string} ksub to look for further sessions
 * @return {!Array<!Map<!Array<string>, !Object>>}
 */
module.exports = function walk(root, ksub='sessions') {
  let pending = (new Link).allOf(root);
  const output = [];

  let link;
  while (link = pending.shift()) {
    const sub = link.value[ksub];
    if (sub !== undefined) {
      // Has sub-sessions, add them to pending list.
      pending = pending.concat(link.allOf(sub));
    } else {
      // This is a leaf node.
      output.push(link.flat());
    }
  }

  return output;
};
