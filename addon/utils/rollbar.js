/* global FastBoot */
import { assign } from '@ember/polyfills';

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
