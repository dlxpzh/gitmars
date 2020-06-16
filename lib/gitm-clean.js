#!/usr/bin/env node
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.function.name");

var program = require('commander');

var sh = require('shelljs');

var _require = require('./js/index'),
    success = _require.success,
    warning = _require.warning;

var _require2 = require('./js/global'),
    pwd = _require2.pwd,
    gitDir = _require2.gitDir;

program.name('gitm clean').description('清理gitmars缓存').option('-f, --force', '强制清理', false).action(function (opt) {
  sh.rm(gitDir + '/.gitmarscommands', gitDir + '/.gitmarslog', gitDir + '/buildConfig.json', gitDir + '/buildConfig.txt');

  if (opt.force) {
    sh.echo(warning('您输入了--force，将同时清理本地gitmars配置文件'));
    sh.rm(pwd + '/gitmarsconfig.json', pwd + '/.gitmarsrc');
  }

  sh.echo(success('清理完毕'));
});
program.parse(process.argv);