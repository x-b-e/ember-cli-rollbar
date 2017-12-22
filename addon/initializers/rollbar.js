import { RollbarConfig, captureEmberErrors, captureEmberLogger } from '../utils/rollbar';

export function initialize(application) {
  let config = new RollbarConfig(application.resolveRegistration('config:environment'));
  if (config.enabled) {
    let instance = config.newInstance();
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
