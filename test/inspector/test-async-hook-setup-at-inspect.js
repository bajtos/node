'use strict';
const common = require('../common');
common.skipIfInspectorDisabled();
common.skipIf32Bits();
common.crashOnUnhandledRejection();
const { NodeInstance } = require('../inspector/inspector-helper.js');
const assert = require('assert');

const script = `start();
function start() {
  setInterval(() => {
    debugger;
  }, 50);
  process._rawDebug('started');
}
`;

async function waitUntilStarted(instance) {
  const msg = 'Timed out waiting for process to start';
  const timeout = common.platformTimeout(1000);
  while (await common.fires(instance.nextStderrString(), msg, timeout) !==
           'started') {}
}

async function checkAsyncStackTrace(session) {
  const paused = await session.waitForBreakOnLine(3, '[eval]');
  assert(paused.params.asyncStackTrace,
         `${Object.keys(paused.params)} contains "asyncStackTrace" property`);
  assert(paused.params.asyncStackTrace.description, 'Timeout');
  assert(paused.params.asyncStackTrace.callFrames
           .some((frame) => frame.functionName === 'start'));
}

async function runTests() {
  const instance = new NodeInstance(['--inspect=0'], script);
  await waitUntilStarted(instance);

  const session = await instance.connectInspectorSession();
  await session.send([
    { 'method': 'Runtime.enable' },
    { 'method': 'Debugger.enable' },
    { 'method': 'Debugger.setAsyncCallStackDepth',
      'params': { 'maxDepth': 10 } },
    { 'method': 'Debugger.setBlackboxPatterns',
      'params': { 'patterns': [] } },
    { 'method': 'Runtime.runIfWaitingForDebugger' }
  ]);

  await checkAsyncStackTrace(session);

  console.error('[test]', 'Stopping child instance');
  session.disconnect();
  instance.kill();
}

runTests();
