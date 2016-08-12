*conflater* is a suite of tools to help you build web experiences for conferences!
We focus on amazing "on-the-day" experiences to help your attendees manage their schedule.

We can help you if you are—

* **Starting a new conference...** you can check out this repo, type `npm install` and `gulp serve` to get an easy-to-extend conference site (actually a [Progressive Web App](https://google.com/search?q=progressive+web+app)) you can immediately use &amp; extened

* **Working on your schedule...** this repo will build drop-in HTML from a common schedule JSON format

* **Making your schedule more engaging...** these tools provide (and are based on) a core suite of [custom elements](https://google.com/search?q=custom+html+elements) which you can drop into your schedule to enable push notifications and seamless timezone support

# Getting Started

To get started with a fully-fleged conference site—

$ git clone https://github.com/GoogleChrome/conflater.git
$ npm install
$ gulp serve

Your browser will open and you'll see the default site! 🎉

This is a Progressive Web App! So, depending on your browser's support levels, the site will: work offline, prompt the user to install to their mobile home screen, and allow you to send notifications to attending users (or just yourself, while on `localhost`).

If you'd like to tweak the output, many of the basic properties (color, title) can be adjusted by editing the `manifest.json` file.
Go ahead and try it now! 🎨

## Try Notifications

Engaging directly with conference attendees is core to conflater. To try it out-

* click the "I'm Attending" button in the top-right of the site
* open your browser's JavaScript console
* find the URL, and open it in a new tab
* type a message hit 'Send'

Depending on [your browser's support levels](http://caniuse.com/#feat=push-api), you'll either receieve a native notification or an in-tab notification (with sound and an in-HTML popup).

## Extending

This default conference site is generated from... *TODO*

To modify it, change the *TODO* and etc.

## Generated Schedule HTML

As part of this, we generate an intermediate *TODO* schedule file which is just raw HTML. It requires *TODO custom elements stuff* and *TODO CSS rules*, but you can use it as a source file for your code.

# Custom Elements

*conflater* is based on a suite of custom elements: the default generated conference site is largely static HTML with the addition of custom elements that provide progressive enhancement.

To use them, you can drop-in code to your site, or include this repository as a dependency to your NPM project.

```bash
$ npm install --save conflater
````

Include the elements in your code (assuming e.g. Browserify or webpack)-

```script
require('conflater');  // side-effects only
```

Or drop-in the script to your site, although note you'll need to include a polyfill for some browsers-

*TODO*

## Catalog

*TODO* catalog of elements
