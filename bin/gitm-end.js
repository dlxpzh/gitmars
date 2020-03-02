#!/usr/bin/env node
const program = require('commander')
const sh = require('shelljs')
const { warning, success, config, queue, getStatus, pwd } = require('./index')
/**
 * gitm end
 */
program
	.name('gitm end')
	.usage('<type> <name>')
	.arguments('<type> <name>')
	.description('合并bugfix任务分支、合并feature功能开发分支，合并完成后将删除对应分支')
	.action(async (type, name, opt) => {
		const allow = ['bugfix', 'feature'] // 允许执行的指令
		let status = await getStatus()
		if (!status) sh.exit(1)
		if (allow.includes(type)) {
			// feature从release拉取，bugfix从bug拉取
			let base = type === 'bugfix' ? config.bugfix : config.release,
				cmd = [
					`git checkout ${config.develop}`,
					`git pull`,
					{
						cmd: `git merge --no-ff ${type}/${name}`,
						config: { slient: false, again: false, success: '分支合并成功', fail: '合并失败，请根据提示处理' }
					},
					{
						cmd: `git push`,
						config: { slient: false, again: true, success: '推送成功', fail: '推送失败，请根据提示处理' }
					},
					`git checkout ${base}`,
					`git pull`,
					{
						cmd: `git merge --no-ff ${type}/${name}`,
						config: { slient: false, again: false, success: '分支合并成功', fail: '合并失败，请根据提示处理' }
					},
					{
						cmd: `git push`,
						config: { slient: false, again: true, success: '推送成功', fail: '推送失败，请根据提示处理' }
					},
					`git branch -D ${type}/${name}`,
					`git checkout ${config.develop}`
				]
			queue(cmd).then(data => {
				data.forEach((el, index) => {
					if (index === 2 || index === 3 || index === 6 || index === 7) {
						if (el.code === 0) {
							sh.echo(success(index === 3 || index === 7 ? '分支合并成功！' : '推送远程成功!'))
						}
					}
				})
			})
		} else {
			sh.echo(warning('type只允许输入：' + JSON.stringify(allow)))
			sh.exit(1)
		}
	})
program.parse(process.argv)
