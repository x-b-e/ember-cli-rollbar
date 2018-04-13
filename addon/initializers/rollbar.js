import { deprecate } from '@ember/application/deprecations';
import { RollbarConfig, captureEmberErrors, captureEmberLogger } from '../utils/rollbar';

export function initialize(application) {
  let config = new RollbarConfig(application.resolveRegistration('config:environment'));
  if (config.rollbarConfig.enabled) {
    let instance = config.newInstance();
    application.register('rollbar:main', instance, { instantiate: false });
    if (config.addonConfig.captureEmberErrors) {
      captureEmberErrors(instance, config.addonConfig.outputEmberErrorsToConsole);
    }
    deprecate(
      'captureEmberLogger is deprecated (along with Ember.Logger) and will be removed in a future release.',
      !config.addonConfig.captureEmberLogger, {
        id: 'RB-LOGGER-1',
        until: '1.0'
      });
    if (config.addonConfig.captureEmberLogger) {
      captureEmberLogger(instance);
    }
  }
}

export default {
  initialize
};
