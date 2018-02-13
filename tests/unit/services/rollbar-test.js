import { moduleFor, test } from 'ember-qunit';

moduleFor('service:rollbar', 'Unit | Service | rollbar', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

test('it exists', function(assert) {
  let service = this.subject();
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
