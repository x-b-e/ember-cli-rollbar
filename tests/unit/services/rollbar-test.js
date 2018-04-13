import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | rollbar', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let service = this.owner.lookup('service:rollbar');
    // Ensure that all the function are wrapped?
    assert.ok(service.instance);
    try {
      service.log('log');
      service.debug('debug');
      service.info('info');
      service.warn('warn');
      service.warning('warning');
      service.error('error');
      service.critical('critical');
    } catch (err) {
      assert.notOk(err, 'These should not fail');
    }
  });
});