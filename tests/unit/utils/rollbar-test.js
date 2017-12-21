import { getServerConfig, getInstance, captureEmberErrors, captureEmberLogger } from 'ember-cli-rollbar/utils/rollbar';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Ember from 'ember';
import sinonTest from 'ember-sinon-qunit/test-support/test';

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

  test('getServerConfig', function(assert) {
    let result = getServerConfig(this.owner);
    assert.deepEqual(result, {
      enabled: true,
      accessToken: 'TEST_SERVER_TOKEN'
    });
  });

  test('getInstance', function(assert) {
    let rollbar = getInstance(this.owner);
    // There's not really much to do here other than check that it looks like Rollbar?
    assert.ok(rollbar.critical, 'critical exists');
    assert.ok(rollbar.debug, 'debug exists');
    assert.ok(rollbar.warning, 'warning exists');
    assert.ok(rollbar.info, 'info exists');
    assert.ok(rollbar.error, 'error exists');
    assert.ok(rollbar.configure, 'configure exists');
  });

  sinonTest('captureEmberErrors', function(assert) {
    let rollbar = new MockRollbar();
    let mock = this.mock(rollbar);
    mock.expects('error');

    let log = this.spy(Logger, 'error');

    let result = captureEmberErrors(rollbar);
    Ember.onerror(new Error('hello'));

    assert.ok(log.calledOnce);
    assert.strictEqual(result, undefined);
    mock.verify();
  });

  sinonTest('captureEmberErrors no console output', function(assert) {
    let rollbar = new MockRollbar();
    let mock = this.mock(rollbar);
    mock.expects('error');

    let log = this.spy(Logger, 'error');

    captureEmberErrors(rollbar, false);
    Ember.onerror(new Error('hello'));

    assert.notOk(log.called);
    mock.verify();
  });

  sinonTest('captureEmberLogger', function(assert) {
    let rollbar = new MockRollbar();
    let mock = this.mock(rollbar);
    mock.expects('info');

    let log = this.spy(Logger, 'info');

    captureEmberLogger(rollbar);
    Ember.Logger.info('my info message');

    assert.ok(log.called);
    mock.verify();
  });
});
