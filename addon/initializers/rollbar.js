import { RollbarConfig, captureEmberErrors, captureEmberLogger } from '../utils/rollbar';

export function initialize(application) {
  let config = new RollbarConfig(application.resolveRegistration('config:environment'));
  if (config.rollbarConfig.enabled) {
    let instance = config.newInstance();
    application.register('rollbar:main', instance, { instantiate: false });
    if (config.addonConfig.captureEmberErrors) {
      captureEmberErrors(instance, config.addonConfig.outputEmberErrorsToConsole);
    }
    if (config.addonConfig.captureEmberLogger) {
      captureEmberLogger(instance);
    }
  }
}

export default {
  initialize
};
