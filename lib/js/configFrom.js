"use strict";

var sh = require('shelljs');

var _require = require('./global'),
    pwd = _require.pwd;

var getConfigFrom = function getConfigFrom() {
  if (sh.test('-f', pwd + '/.gitmarsrc')) {
    return 1;
  } else if (sh.test('-f', pwd + '/gitmarsconfig.json')) {
    return 2;
  }

  return 0;
};

module.exports = getConfigFrom();