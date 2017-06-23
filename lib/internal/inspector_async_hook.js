'use strict';

const { createHook } = require('async_hooks');
const inspector = process.binding('inspector');

if (!inspector || !inspector.asyncTaskScheduled) return;

module.exports = createHook({
  init(asyncId, type, triggerId, resource) {
    // TODO(bajtos): support recurring tasks like setInterval
    const recurring = false;
    inspector.asyncTaskScheduled(type, asyncId, recurring);
  },

  before(asyncId) {
    inspector.asyncTaskStarted(asyncId);
  },

  after(asyncId) {
    inspector.asyncTaskFinished(asyncId);
  },

  destroy(asyncId) {
    inspector.asyncTaskCanceled(asyncId);
  },
});
