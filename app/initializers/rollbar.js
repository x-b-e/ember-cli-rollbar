import Ember from 'ember';

const { Logger } = Ember;

function wrap(fn, method) {
  return function() {
    window.Rollbar[method](...arguments);
    fn.apply(this, arguments);
  };
}

// Copied from ember-metal
function getStack(error) {
  let { stack, message } = error;

  if (stack && stack.indexOf(message) === -1) {
    stack = `${message}\n${stack}`;
  }
  return stack;
}

function initialize() {
  if (window.Rollbar) {
    let origError = Logger.error;
    Logger.error = wrap(Logger.error, 'error');
    Logger.warn = wrap(Logger.warn, 'warning');
    Logger.info = wrap(Logger.info, 'info');
    Logger.debug = wrap(Logger.debug, 'debug');
    Ember.onerror = function(err) {
      window.Rollbar.error(err);
      origError(getStack(err));
    };
  }
}

export default {
  name: 'rollbar',
  initialize
};
