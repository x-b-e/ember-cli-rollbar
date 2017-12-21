/* global FastBoot */
import { assign } from '@ember/polyfills';
import Ember from "ember";

const { Logger } = Ember;

/**
 * Returns the configuration for the server-side of Rollbar.
 * Basically it is what is in the environment (and stored in window._rollbarConfig)
 * but replacing the client-side token with a server-side one.
 */
export function getServerConfig(owner) {
  let env = owner.resolveRegistration('config:environment');
  let addonConfig = env['ember-cli-rollbar'];
  return assign({}, env.rollbar, {
    accessToken: addonConfig.serverToken
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
export function getInstance(owner) {
  if (typeof FastBoot !== 'undefined') {
    const Rollbar = FastBoot.require('rollbar');
    return new Rollbar(getServerConfig(owner));
  } else {
    /* global Rollbar */
    return Rollbar;
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
    // Fastboot's default error handle always prints to the console.
    Ember.onerror = function(err) {
      instance.error(err);
    };
  } else {
    // Note this will continue to output the error to the console,
    // even when it's captured by Rollbar. If you'd prefer to not do this,
    // set outputToConsole = false.
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
  }
  return previous;
}

function wrapLogger(instance, fn, method) {
  return function() {
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
