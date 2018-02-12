import Application from '@ember/application';
import { run } from '@ember/runloop';
import Ember from 'ember';

import { initialize } from 'dummy/initializers/rollbar';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';

const { Logger } = Ember;

module('Unit | Initializer | rollbar', {
  beforeEach() {
    run(() => {
      this.application = Application.create();
      this.application.register('config:environment', {
        rollbar: {
          enabled: true
        },
        'ember-cli-rollbar': {
          captureEmberLogger: true
        }
      });
      // Save all logger methods to switch back
      this.oldError = Logger.error;
      this.oldWarn = Logger.warn;
      this.oldInfo = Logger.info;
      this.oldDebug = Logger.debug;

      this.application.deferReadiness();
    });
  },
  afterEach() {
    destroyApp(this.application);
    Ember.onerror = undefined;
    Logger.error = this.oldError;
    Logger.warn = this.oldWarn;
    Logger.info = this.oldInfo;
    Logger.debug = this.oldDebug;
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  initialize(this.application);
  // Ember.Logger methods are patched
  assert.ok(Logger.info.toString().includes('rollbarWrapper'));
  // Ensure that the instance is registered
  assert.ok(this.application.__container__.lookup('rollbar:main'));
});
