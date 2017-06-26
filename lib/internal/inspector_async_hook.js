'use strict';

const { createHook } = require('async_hooks');
const inspector = process.binding('inspector');
const errors = require('internal/errors');

if (!inspector || !inspector.asyncTaskScheduled) return;

module.exports = createHook({
  init(asyncId, type, triggerId, resource) {
    if (!Number.isInteger(asyncId))
      throw new errors.TypeError('ERR_INVALID_ARG_TYPE', 'asyncId', 'integer');
    if (typeof type !== 'string')
      throw new errors.TypeError('ERR_INVALID_ARG_TYPE', 'type', 'string');
    // TODO(bajtos): support recurring tasks like setInterval
    const recurring = false;
    inspector.asyncTaskScheduled(type, asyncId, recurring);
  },

  before(asyncId) {
    if (!Number.isInteger(asyncId))
      throw new errors.TypeError('ERR_INVALID_ARG_TYPE', 'asyncId', 'integer');
    inspector.asyncTaskStarted(asyncId);
  },

  after(asyncId) {
    if (!Number.isInteger(asyncId))
      throw new errors.TypeError('ERR_INVALID_ARG_TYPE', 'asyncId', 'integer');
    inspector.asyncTaskFinished(asyncId);
  },

  destroy(asyncId) {
    if (!Number.isInteger(asyncId))
      throw new errors.TypeError('ERR_INVALID_ARG_TYPE', 'asyncId', 'integer');
    inspector.asyncTaskCanceled(asyncId);
  },
});
