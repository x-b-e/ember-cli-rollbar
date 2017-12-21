/* eslint-env node */
/* eslint-disable object-shorthand */
'use strict';

const mergeTrees = require('broccoli-merge-trees');
const writeFile = require('broccoli-file-creator');

module.exports = {
  name: 'ember-cli-rollbar',

  _getConfig() {
    let env = this.app.env;
    // If 'enabled' is not defined in the config, it is intelligently decided on.
    // Note that this doesn't affect whether the snipped it *included*.
    // It is always included, but this determines whether or not it's enabled.
    let defaultEnabled = env !== 'development' && env !== 'test';
    let config = this.project.config(env).rollbar || {};
    config.enabled = typeof config.enabled !== 'undefined' ? config.enabled : defaultEnabled;
    return config;
  },

  _generateConfigTree() {
    return writeFile('ember-cli-rollbar/config.js', `
      window._rollbarConfig = ${JSON.stringify(this._getConfig())};
    `);
  },

  treeForVendor(tree) {
    tree = mergeTrees([tree, this._generateConfigTree()]);
    return this._super.treeForVendor.call(this, tree);
  },

  included(app) {
    this._super.included.apply(this, arguments);

    app.import('node_modules/rollbar/dist/rollbar.snippet.js', {
      prepend: true,
      using: [{transformation: 'fastbootShim'}]
    });
    app.import('vendor/ember-cli-rollbar/config.js', {
      prepend: true,
      using: [{transformation: 'fastbootShim'}]
    });
    app.import('vendor/rollbar-module.js');
  }
};
