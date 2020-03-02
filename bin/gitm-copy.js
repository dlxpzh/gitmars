#!/usr/bin/env node
const program = require('commander')
const sh = require('shelljs')
const { warning, success, queue, getStatus, getCurrent } = require('./index')
/**
 * gitm copy
 */
program
	.name('gitm copy')
	.usage('<from> [commitid...] [-k] [-a]')
	.arguments('<from> [commitid...]')
	.description('cherry-pick易用版本，从某个分支拷贝某条记录合并到当前分支')
	.option('-k, --key [keyword]', '模糊搜索commit信息关键词', '')
	.option('-a, --author [author]', '提交者', '')
	.action(async (from, commitid, opts) => {
		let status = await getStatus(),
			cur = await getCurrent()
		if (!status) sh.exit(1)
		if (opts.key !== '' || opts.author !== '') {
			let cmd = [`git checkout ${from}`, `git log --grep=${opts.key} --author=${opts.author}`]
			if (!/^\d{4,}$/.test(opts.key)) {
				sh.echo(warning('为确保copy准确，关键词必须是4位以上的任务号或者bug修复编号'))
				sh.exit(1)
			}
			queue(cmd).then(data => {
				let commits = []
				if (data[1].code === 0) {
					let logs = data[1].out.match(/(commit\s[a-z0-9]*\n+)/g) || [],
						cmds = [`git checkout ${cur}`]
					logs.forEach(el => {
						commits.push(el.replace(/(commit\s)|\n/g, ''))
					})
					if (commits.length > 0) {
						cmds = cmds.concat([
							{
								cmd: `git cherry-pick ${commits.join(' ')}`,
								config: { slient: false, again: false, success: '记录合并成功', fail: '合并失败，请根据提示处理' }
							},
							{
								cmd: `git push`,
								config: { slient: false, again: true, success: '推送成功', fail: '推送失败，请根据提示处理' }
							}
						])
					} else {
						sh.echo('没有找到任何记录')
					}
					queue(cmds).then(data1 => {
						sh.echo(success('指令执行完毕'))
					})
				} else {
					sh.echo(data[1].err)
				}
			})
		} else {
			let cmd = [
				{
					cmd: `git cherry-pick ${commitid.join(' ')}`,
					config: { slient: false, again: false, success: '记录合并成功', fail: '合并失败，请根据提示处理' }
				},
				{
					cmd: `git push`,
					config: { slient: false, again: true, success: '推送成功', fail: '推送失败，请根据提示处理' }
				}
			]
			queue(cmd).then(data => {
				sh.echo(success('指令执行完毕'))
			})
		}
	})
program.parse(process.argv)
