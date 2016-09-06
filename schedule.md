This document describes the *conflater* schedule format, which is JSON-formatted data.
For a real example, open the sample [schedule.json](schedule.json) file.

```json
{
  "config": {},
  "speakers": {},
  "sessions: []
}
```

Each file requires fields for config, speakers and sessions.

## Config

Currently, the only (required) config field is `timezone`, which must be a timezone recognized by [MomentJS timezone](http://momentjs.com/timezone/), e.g. "US/Pacific" or "Australia/Melbourne".

## Speakers

Speakers is a map from ID to speaker information.
Speaker information may be either-

1. a string name, e.g. "Larry Page"
2. an object containing key `name`, e.g. `{"name": "Sergey Brin"}`

This map can be empty, but it's used as a lookup for speakers as specified session information.
If a speaker is giving multiple talks, list them here to reduce duplication.
For example-

```js
"speakers": {
  "page": {"name": "Larry Page"},
  "sergey": "Sergey Brin"
}
```

### Speaker Object

The speaker information object can contain any number of keys, but `name` is the only one required.

*TODO conventional fields*

## Sessions

Contains sessions for a conference.
This must be an array or map (from ID) containing session information.
Each value must be an object containing a string `name` and `when` (a time parseable by [MomentJS](https://moment.js/)), with optional string `id` and array `speakers`.
For example-

```js
"sessions": {
  "an-intro-to-dev": {
    "name": "An introduction to development",
    "speakers": ["page", "Paul Kinlan", {"name": "Paul Lewis"}],
      "when": "2016-11-11T10:00"
  }
}
```

Speakers will be looked up inside the [speakers map](#Speakers), or interpreted as speaker information (as name or object containing `name`).

### Session Tree

Sessions may actually be a tree.
Leaf nodes in this tree are treated as real events, and they inherit values from their parents.
This can be useful to group events by track, speaker or any other property.
For example-

```js
"sessions": [{
  "track": "Android",
  "sessions": [{
    "name": "Welcome to Android Nougat",
    "speakers": ["sergey"],
    "when": "2016-11-11T10:00"
  }, {
    "name": "The Compatibility Story",
    "speakers": ["To Be Announced"],
    "when": "2016-11-11T13:00"
  }]
}]
```
  
### Session Object

The only required fields for each session are `name` and `when`.
If `id` is specified, it will be used as the session's ID, presuming it doesn't collide with another ID; otherwise, a simple ID will be generated based on the `name` or parent IDs/names.

* `when` should be specified in local time without timezone information (e.g. "2016-09-04T10:00"), and it will be parsed in the config timezone

*TODO conventional fields*
