#!/usr/bin/env node
const program = require('commander')
const sh = require('shelljs')
const { error, success, config, queue, getStatus, pwd, runJenkins, appName } = require('./index')
/**
 * gitm combine
 */
program
	.name('gitm combine')
	.usage('<type> <name> [-d --dev] [-p --prod]')
	.arguments('<type> <name>')
	.description('合并bugfix任务分支、合并feature功能开发分支、合并support分支')
	.option('-d, --dev', '是否同步到alpha测试环境', false)
	.option('-p, --prod', '是否同步到预发布环境', false)
	.option('-b, --build [build]', '需要构建的应用')
	.option('--no-bugfix', '不同步到bug分支')
	.option('--as-feature', 'bug分支合并到release')
	.action(async (type, name, opt) => {
		const allow = ['bugfix', 'feature', 'support'] // 允许执行的指令
		let status = await getStatus()
		if (!opt.dev && !opt.prod) {
			sh.echo('请输入需要同步到的环境')
			sh.exit(1)
		}
		if (!status) sh.exit(1)
		if (allow.includes(type)) {
			let base = type === 'bugfix' ? config.bugfix : config.release,
				cmd = []
			if (opt.dev) {
				cmd = cmd.concat([
					`git fetch`,
					`git checkout ${config.develop}`,
					`git pull`,
					{
						cmd: `git merge --no-ff ${type}/${name}`,
						config: { slient: false, again: false, success: `${type}/${name}合并到${config.develop}成功`, fail: `${type}/${name}合并到${config.develop}出错了，请根据提示处理` }
					},
					{
						cmd: `git push`,
						config: { slient: false, again: true, success: '推送成功', fail: '推送失败，请根据提示处理' }
					},
					`git checkout ${type}/${name}`
				])
				if (opt.build) {
					cmd = cmd.concat([
						{
							cmd: `gitm build jenkins --env dev --project ${appName} --app ${opt.build === true ? 'all' : opt.build}`,
							config: { slient: true, again: false, success: '调起构建成功', fail: '调起构建失败' }
						}
					])
				}
			}
			if (opt.prod) {
				cmd = cmd.concat([
					`git fetch`,
					`git checkout ${base}`,
					`git pull`,
					{
						cmd: `git merge --no-ff ${type}/${name}`,
						config: { slient: false, again: false, success: `${type}/${name}合并到${base}成功`, fail: `${type}/${name}合并到${base}出错了，请根据提示处理` }
					},
					{
						cmd: `git push`,
						config: { slient: false, again: true, success: '推送成功', fail: '推送失败，请根据提示处理' }
					},
					`git checkout ${type}/${name}`
				])
				// bugfix分支走release发布
				if (type === 'bugfix' && opt.asFeature) {
					cmd = cmd.concat([
						`git fetch`,
						`git checkout ${config.release}`,
						`git pull`,
						{
							cmd: `git merge --no-ff ${type}/${name}`,
							config: { slient: false, again: false, success: `${type}/${name}合并到${config.release}成功`, fail: `${type}/${name}合并到${config.release}出错了，请根据提示处理` }
						},
						{
							cmd: `git push`,
							config: { slient: false, again: true, success: '推送成功', fail: '推送失败，请根据提示处理' }
						},
						`git checkout ${type}/${name}`
					])
				}
				// support分支需要合到bugfix
				if (type === 'support' && opt.bugfix) {
					cmd = cmd.concat([
						`git fetch`,
						`git checkout ${config.bugfix}`,
						`git pull`,
						{
							cmd: `git merge --no-ff ${type}/${name}`,
							config: { slient: false, again: false, success: `${type}/${name}合并到${config.bugfix}成功`, fail: `${type}/${name}合并到${config.bugfix}出错了，请根据提示处理` }
						},
						{
							cmd: `git push`,
							config: { slient: false, again: true, success: '推送成功', fail: '推送失败，请根据提示处理' }
						},
						`git checkout ${type}/${name}`
					])
				}
				// 仅支持构建bug
				if (opt.build) {
					if (type === 'bugfix') {
						cmd = cmd.concat([
							{
								cmd: `gitm build jenkins --env bug --project ${appName} --app ${opt.build}`,
								config: { slient: true, again: false, success: '调起构建成功', fail: '调起构建失败' }
							}
						])
					}
					// support分支要构建bug和release
					if (type === 'support' && opt.bugfix) {
						cmd = cmd.concat([
							{
								cmd: `gitm build jenkins --env bug --project ${appName} --app ${opt.build}`,
								config: { slient: true, again: false, success: '调起构建成功', fail: '调起构建失败' }
							}
						])
					}
				}
			}
			queue(cmd)
		} else {
			sh.echo(error('type只允许输入：' + JSON.stringify(allow)))
			sh.exit(1)
		}
	})
program.parse(process.argv)
