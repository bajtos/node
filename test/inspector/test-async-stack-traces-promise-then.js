'use strict';
const common = require('../common');
common.skipIfInspectorDisabled();
const helper = require('./inspector-helper');
const assert = require('assert');

const script = 'Promise.resolve().then(() => { debugger; });';

helper.debugScriptAndAssertPausedMessage(script, (msg) => {
  assert(
    !!msg.params.asyncStackTrace,
    `${Object.keys(msg.params)} contains "asyncStackTrace" property`);
});
