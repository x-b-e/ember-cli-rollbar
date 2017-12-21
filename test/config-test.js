'use strict';

const Buffer = require('buffer').Buffer;
const chai = require('chai');
const expect = chai.expect;
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const fs = require('fs');
const glob = require('glob');
const vm = require('vm');

function readConfig(path) {
  let f = fs.openSync(path, 'r');
  let buf = Buffer.alloc(10000);
  fs.readSync(f, buf, 0, 10000);

  let pattern = new RegExp(/(window\._rollbarConfig\s*=\s*.*)[;,]/);
  let matches = buf.toString().match(pattern);

  // This is needed so we don't have to rely on the order of items in the JSON,
  // or whatever happens to the generated code when it is minimized.
  // Perhaps there's a better way to verify the configuration
  // then having to find and parse JavaScript? Like render it in a template?
  const sandbox = {'window': {}};
  vm.createContext(sandbox);
  vm.runInContext(matches[1], sandbox);
  return sandbox.window._rollbarConfig;
}

describe('configuration is set correctly', function() {
  this.timeout(400000);
  let app;

  before(function() {
    app = new AddonTestApp();
    return app.create('rollbar-config', {
      emberVersion: '2.17',
      emberDataVersion: '2.17'
    });
  });

  it('is disabled by default in development builds', function() {
    return app.runEmberCommand('build')
      .then(function() {
        let config = readConfig(app.filePath('dist/assets/vendor.js'));
        expect(config).to.deep.equal({
          enabled: false,
          accessToken: 'xxxyyyzzz'
        });
      });
  });
  it('is enabled by default in production builds', function() {
    return app.runEmberCommand('build', '--environment=production')
      .then(function() {
        let vendorPath = glob.sync(app.filePath('dist/assets/vendor-*.js'))[0];
        let config = readConfig(vendorPath);
        expect(config).to.deep.equal({
          enabled: true,
          accessToken: 'xxxyyyzzz'
        });
      });
  });
});
