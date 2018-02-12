import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  rollbar: service(),

  actions: {
    log() {
      this.get('rollbar').log('Test log');
    },
    debug() {
      this.get('rollbar').debug('Test debug');
    },
    info() {
      this.get('rollbar').info('Test info');
    },
    warn() {
      this.get('rollbar').warn('Test warn');
    },
    warning() {
      this.get('rollbar').warning('Test warning');
    },
    error() {
      this.get('rollbar').error('Test error');
    },
    critical() {
      this.get('rollbar').critical('Test critical');
    }
  }
});
