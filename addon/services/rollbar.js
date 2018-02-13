import Service from '@ember/service';
import { getOwner } from '@ember/application';

function wrapConsole(name) {
  /* eslint-disable no-console */
  return function() {
    if (console && console[name]) {
      console[name](...arguments);
    }
  };
}

export default Service.extend({
  init() {
    this._super(...arguments);

    let rollbar = getOwner(this).lookup('rollbar:main');
    if (rollbar) {
      this.instance = rollbar;
    } else {
      // In this case, forward to the console if it exists
      this.instance = {
        log: wrapConsole('log'),
        debug: wrapConsole('debug'),
        info: wrapConsole('info'),
        warn: wrapConsole('warn'),
        warning: wrapConsole('warn'),
        error: wrapConsole('error'),
        critical: wrapConsole('error'),
      };
    }
  },

  log() {
    return this.instance.log(...arguments);
  },
  debug() {
    return this.instance.debug(...arguments);
  },
  info() {
    return this.instance.info(...arguments);
  },
  warn() {
    return this.instance.warn(...arguments);
  },
  warning() {
    return this.instance.warning(...arguments);
  },
  error() {
    return this.instance.error(...arguments);
  },
  critical() {
    return this.instance.critical(...arguments);
  }
});
