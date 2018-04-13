import Application from '@ember/application';

import { initialize } from 'dummy/initializers/rollbar';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import Ember from 'ember';

const { Logger } = Ember;

module('Unit | Initializer | foo', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.TestApplication = Application.extend();
    this.TestApplication.initializer({
      name: 'initializer under test',
      initialize
    });

    this.application = this.TestApplication.create({ autoboot: false });
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
  });

  hooks.afterEach(function() {
    run(this.application, 'destroy');
    Ember.onerror = undefined;
    Logger.error = this.oldError;
    Logger.warn = this.oldWarn;
    Logger.info = this.oldInfo;
    Logger.debug = this.oldDebug;
  });

  test('it works', async function(assert) {
    run(this.application, 'boot');

    assert.ok(Logger.info.toString().includes('rollbarWrapper'), 'Logger methods are patched');
    assert.ok(this.owner.lookup('rollbar:main'), 'Instance is registered');
  });
});
