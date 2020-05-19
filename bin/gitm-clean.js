#!/usr/bin/env node
const program = require('commander')
const sh = require('shelljs')
const { error, success, warning, config, configFrom, queue, pwd, gitDir } = require('./index')
/**
 * gitm clean
 */
program
	.name('gitm clean')
	.description('清理gitmars缓存')
	.option('-f, --force', '强制清理', false)
	.action(opt => {
		sh.rm(gitDir + '/.gitmarscommands', gitDir + '/.gitmarslog')
		if (opt.force) {
			sh.echo(warning('您输入了--force，将同时清理本地gitmars配置文件'))
			sh.rm(pwd + '/gitmarsconfig.json', pwd + '/.gitmarsrc')
		}
		sh.echo(success('清理完毕'))
	})
program.parse(process.argv)