import { RollbarConfig, captureEmberErrors, captureEmberLogger } from 'ember-cli-rollbar2/utils/rollbar';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Ember from 'ember';
import setupSinonTest from '../../helpers/sinon';

const { Logger } = Ember;

class MockRollbar {
  info() {}
  error() {}
}

module('Unit | Utility | rollbar', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Ember.onerror = undefined;
  });
  hooks.afterEach(function() {
    Ember.onerror = undefined;
  });

  test('it is disabled by default when environment==development', function(assert) {
    let config = new RollbarConfig({
      environment: 'development'
    });
    assert.strictEqual(config.rollbarConfig.enabled, false);
  });

  test('it is disabled by default when environment==test', function(assert) {
    let config = new RollbarConfig({
      environment: 'test'
    });
    assert.strictEqual(config.rollbarConfig.enabled, false);
  });

  test('it is disabled by default when environment==production', function(assert) {
    let config = new RollbarConfig({
      environment: 'production'
    });
    assert.strictEqual(config.rollbarConfig.enabled, true);
  });

  test('addonConfig', function(assert) {
    let config = new RollbarConfig({
      'ember-cli-rollbar': {
        serverToken: 'xxxyy',
        outputEmberErrorsToConsole: false
      }
    });
    assert.deepEqual(config.addonConfig, {
      serverToken: 'xxxyy',
      captureEmberErrors: true,
      outputEmberErrorsToConsole: false,
      captureEmberLogger: false,
      serverTokenEnv: undefined
    })
  });

  test('serverConfig', function(assert) {
    let config = new RollbarConfig({
      rollbar: {
        enabled: true,
        accessToken: 'CLIENT_TOKEN'
      },
      'ember-cli-rollbar': {
        serverToken: 'SERVER_TOKEN'
      }
    });
    assert.deepEqual(config.serverConfig, {
      enabled: true,
      accessToken: 'SERVER_TOKEN'
    });
  });

  test('serverConfig, default disabled', function(assert) {
    let config = new RollbarConfig({
      environment: 'development'
    });
    assert.strictEqual(config.serverConfig.enabled, false);
  });

  test('serverConfig, default enabled', function(assert) {
    let config = new RollbarConfig({
      environment: 'production'
    });
    assert.strictEqual(config.serverConfig.enabled, true);
  });

  test('getInstance', function(assert) {
    let config = new RollbarConfig({});
    let rollbar = config.newInstance();
    // There's not really much to do here other than check that it looks like Rollbar?
    assert.ok(rollbar.critical, 'critical exists');
    assert.ok(rollbar.debug, 'debug exists');
    assert.ok(rollbar.warning, 'warning exists');
    assert.ok(rollbar.info, 'info exists');
    assert.ok(rollbar.error, 'error exists');
    assert.ok(rollbar.configure, 'configure exists');
  });

  module('sinon tests', function(hooks) {
    setupSinonTest(hooks);

    test('captureEmberErrors', function(assert) {
      let rollbar = new MockRollbar();
      let mock = this.sinon.mock(rollbar);
      mock.expects('error');

      let log = this.sinon.spy(Logger, 'error');

      let result = captureEmberErrors(rollbar);
      Ember.onerror(new Error('hello'));

      assert.ok(log.calledOnce);
      assert.strictEqual(result, undefined);
      mock.verify();
    });

    test('captureEmberErrors no console output', function(assert) {
      let rollbar = new MockRollbar();
      let mock = this.sinon.mock(rollbar);
      mock.expects('error');

      let log = this.sinon.spy(Logger, 'error');

      captureEmberErrors(rollbar, false);
      Ember.onerror(new Error('hello'));

      assert.notOk(log.called);
      mock.verify();
    });

    test('captureEmberLogger', function(assert) {
      let rollbar = new MockRollbar();
      let mock = this.sinon.mock(rollbar);
      mock.expects('info');

      let log = this.sinon.spy(Logger, 'info');

      captureEmberLogger(rollbar);
      Ember.Logger.info('my info message');

      assert.ok(log.called);
      mock.verify();
    });
  });
});
