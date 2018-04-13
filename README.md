# ember-cli-rollbar2
## Seamless, automatic Rollbar integration for Ember and Fastboot apps

[![Build Status](https://travis-ci.org/paulcwatts/ember-cli-rollbar.svg?branch=master)](https://travis-ci.org/paulcwatts/ember-cli-rollbar)
[![Maintainability](https://api.codeclimate.com/v1/badges/faeeb0c063a9696c61cd/maintainability)](https://codeclimate.com/github/paulcwatts/ember-cli-rollbar/maintainability)
[![Dependency Status](https://david-dm.org/paulcwatts/ember-cli-rollbar.svg)](https://david-dm.org/paulcwatts/ember-cli-rollbar)
[![npm version](https://badge.fury.io/js/ember-cli-rollbar2.svg)](https://badge.fury.io/js/ember-cli-rollbar2)
[![Greenkeeper badge](https://badges.greenkeeper.io/paulcwatts/ember-cli-rollbar.svg)](https://greenkeeper.io/)

## Installation

Install as a standard Ember Addon:

* `ember install ember-cli-rollbar2`

## Usage

In your `config/environment.js` file:

```js
let ENV = {
  rollbar: {
    // Rollbar configuration goes here
    accessToken: 'POST_CLIENT_ITEM_ACCESS_TOKEN'
  },
  'ember-cli-rollbar': {
    // Addon configuration goes here

  }
};
```

## Configuration

### Rollbar library

The [Rollbar Configuration](https://rollbar.com/docs/notifier/rollbar.js/#configuration-reference) is specified 
in the `rollbar` key in the environment. See the Rollbar documentation for available options.

If `enabled` is not set, this addon will automatically enable Rollbar if the Ember environment is `production`.

### Addon options

- `captureEmberErrors`: Defaults to `true`. The addon can set `Ember.onerror` to capture errors sent by Ember.
- `outputEmberErrorsToConsole`: Defaults to `true`. When catching Ember errors, it also writes these errors to the console.
  If you prefer to not have your errors logged to the console, set this to `false`.
- `captureEmberLogger`: Defaults to `false`. The addon can override `Ember.Logger` and send those notifications to Rollbar.

## Rollbar service

This adds a `rollbar` service to your app which exposes the Rollbar client library to your application. 
You can use this service to log messages explicitly in outside of exceptions or `Ember.Logger` overrides:

```js
  import Controller from '@ember/controller';
  import { inject as service } from '@ember/service';
  
  export default Controller.extend({
    rollbar: service(),
  
    actions: {
      doSomething() {
        try {
          somethingThatMightFail();
        } catch (err) {
          this.get('rollbar').error('Caught an exception', err);
        }
      }
    }
  });
```

The service directly exposes the methods `log`, `debug`, `info`, `warn`, `warning`, `error`, and `critical`.
The Rollbar client instance itself can be accessed via the `instance` property.

## FastBoot Support

FastBoot support is *mostly* automatic, however there some changes you will need to make to your project: 

1. In `package.json`, move the `rollbar` package from `devDependencies` to `dependencies`.
2. Also in `package.json`, add `rollbar` to your `fastbootDependencies`:

```json
  "fastbootDependencies": [
    "rollbar"
  ]
```

In addition, when in FastBoot mode, the Rollbar Node library cannot use the Rollbar client token, it 
must use a *server* token to access its API. 

There are two ways to provide this token, in the section below.

### Rollbar Access Token Configuration in FastBoot

You may choose to set Rollbar's `POST_SERVER_ITEM_ACCESS_TOKEN` directly in the addon configuration:

```js
let ENV = {
  'ember-cli-rollbar': {
    serverToken: 'POST_SERVER_ITEM_ACCESS_TOKEN'
  }
};
```

The downside of using `serverToken` is that the server token is then leaked into the client configuration
and visible in the browser. If you don't want that, you can add it to a process environment variable which
the addon will read:

```js
let ENV = {
  'ember-cli-rollbar': {
    serverTokenEnv: 'MY_TOKEN_ENV_VAR'
  }
};
```

In this case, the addon will use value of the `MY_TOKEN_ENV_VAR` environment variable in the FastBoot process 
as the server token. In addition, in order to use this you will need to add `process` to your list
of `fastbootDependencies`:

```json
  "fastbootDependencies": [
    "process",
    "rollbar"
  ]
```

## Contributing

### Installation

* `git clone https://github.com/paulcwatts/ember-cli-rollbar.git`
* `cd ember-cli-rollbar`
* `npm install`

### Linting

* `npm run lint:js`
* `npm run lint:js -- --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## Support

ember-cli-rollbar2 is tested with:

* Ember versions 2.12, 2.16 and 2.18 and 3.1+
* Rollbar versions 2.3+
* Node versions 4+
