#!/usr/bin/env node
const program = require('commander')
const shell = require('shelljs')
const { warning, success, defaults, config, configFrom, wait, pwd } = require('./index')
let doShellProgram = list => {
	return new Promise((resolve, reject) => {
		let r = []
		if (list.length === 0) reject('指令名称不能为空')
		wait(list, (data, cb) => {
			if (!data) {
				// 只有一条指令，不需返回数组形式
				resolve(r.length === 1 ? r[0] : r)
			} else {
				shell.exec(data, { silent: false }, (code, out, err) => {
					try {
						out = JSON.parse(out)
					} catch (err) {
						out = out.replace(/\n*$/g, '')
					}
					r.push({ code, out, err })
					cb()
				})
			}
		})
	})
}
/**
 * gitm admin start
 * gitm admin end
 */
program
	.name('gitm admin')
	.usage('<command> <type> <name>')
	.command('start <type> <name>')
	.description('对发版分支bugfix、release的操作')
	.action((type, name) => {
		if (configFrom === 0) {
			shell.echo(warning('您还没有初始化项目\n请先执行: gitm init'))
			shell.exit(1)
		}
		if ([config.bugfix, config.release, config.support, config.feature].includes(type)) {
			// feature从dev拉取，其他从master拉取
			let base = [config.bugfix, config.release, config.support].includes(type) ? config.master : config.develop,
				cmd = [`cd ${pwd}`, `git checkout -b ${type}/${name} ${base}`]
			doShellProgram(cmd).then(data => {
				//
			})
		}
	})
program.parse(process.argv)
