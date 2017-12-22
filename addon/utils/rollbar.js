/* global FastBoot */
import { assign } from '@ember/polyfills';
import Ember from "ember";

const { Logger } = Ember;

const CONFIG_DEFAULTS = {
  captureEmberErrors: true,
  outputEmberErrorsToConsole: true,
  captureEmberLogger: false,
  serverTokenEnv: undefined
};

export class RollbarConfig {
  constructor(env) {
    this.environment = env.environment;
    this._rollbarConfig = env.rollbar || {};
    this._rollbarConfig.enabled = this._calculateEnabled();
    this._addonConfig = assign({}, CONFIG_DEFAULTS, env['ember-cli-rollbar']);
  }

  _calculateEnabled() {
    let defaultEnabled = this.environment !== 'development' && this.environment !== 'test';
    let enabled = this.rollbarConfig.enabled;
    return typeof enabled !== 'undefined' ? enabled: defaultEnabled;
  }

  get rollbarConfig() {
    return this._rollbarConfig;
  }

  get addonConfig() {
    return this._addonConfig;
  }

  /**
   * This allows you to specify the Rollbar server token in a process environment
   * variable, so it doesn't end up being leaked into the client Ember environment.
   */
  _getServerToken() {
    if (this.addonConfig.serverTokenEnv && typeof FastBoot !== undefined) {
      const process = FastBoot.require('process');
      return process.env[this.addonConfig.serverTokenEnv];
    } else {
      return this.addonConfig.serverToken;
    }
  }

  /**
   * Returns the configuration for the server-side of Rollbar.
   * Basically it is what is in the environment (and stored in window._rollbarConfig)
   * but replacing the client-side token with a server-side one.
   */
  get serverConfig() {
    return assign({}, this.rollbarConfig, {
      accessToken: this._getServerToken()
    });
  }

  /**
   * Gets an instance of Rollbar client, depending on whether or not you are in FastBoot.
   *
   * The Rollbar client acts like a single library, but it really is
   * two libraries mushed into one: one that works in Node and one that
   * works in the Browser. You can't conflate the two. In particular,
   * the Browser library can't work in Node, and the Node library can't work
   * in the browser. In addition, they both expect different access token types.
   *
   * In addition, due to the packaging limitations of the Rollbar client library,
   * we cannot support non-singletons in non-FastBoot versions.
   */
  newInstance() {
    if (typeof FastBoot !== 'undefined') {
      const Rollbar = FastBoot.require('rollbar');
      return new Rollbar(this.serverConfig);
    } else {
      /* global Rollbar */
      return Rollbar;
    }
  }
}

// Copied from ember-metal
function getStack(error) {
  let { stack, message } = error;

  if (stack && stack.indexOf(message) === -1) {
    stack = `${message}\n${stack}`;
  }
  return stack;
}

/**
 * Wraps Ember.onerror with Rollbar. Returns the old value of onerror.
 */
export function captureEmberErrors(instance, outputToConsole = true) {
  let previous = Ember.onerror;

  if (typeof FastBoot !== 'undefined') {
    // Fastboot's default error handler always prints to the console so we don't have to.
    outputToConsole = false;
  }

  if (outputToConsole) {
    let origError = Logger.error;
    Ember.onerror = function(err) {
      instance.error(err);
      origError(getStack(err));
    };
  } else {
    Ember.onerror = function(err) {
      instance.error(err);
    };
  }
  return previous;
}

function wrapLogger(instance, fn, method) {
  return function rollbarWrapper() {
    instance[method](...arguments);
    fn.apply(this, arguments);
  };
}

/**
 * Wraps Ember.Logger methods in Rollbar.
 */
export function captureEmberLogger(instance) {
  Logger.error = wrapLogger(instance, Logger.error, 'error');
  Logger.warn = wrapLogger(instance, Logger.warn, 'warning');
  Logger.info = wrapLogger(instance, Logger.info, 'info');
  Logger.debug = wrapLogger(instance, Logger.debug, 'debug');
}
