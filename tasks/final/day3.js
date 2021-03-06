'use strict'

var fs = require('fs')
var path = require('path')
var xss = require('xss')
var express = require('express')

var app = express()

function count(filePath) {

  if (!filePath) {
    throw new Error('缺少统计文件路径')
  }

  var num = 0

  try {
    // 检查文件是否已创建
    // 参考
    fs.accessSync(filePath, fs.F_OK)
    // 同步读入文件内容，获取初始值
    num = parseInt(fs.readFileSync(filePath), 10)
  }
  catch (e) {
    fs.writeFileSync(filePath, num)
  }

  if (isNaN(num)) {
    num = 0
  }

  return function(req, res, next) {
    console.log(req.url)

    // 只处理 GET 请求同时去除 favicon 二次请求干扰
    if (req.method === 'GET' && req.url.indexOf('/favicon.ico') === -1) {
      num++

      // 简化难度，以同步的写入，实际线上会存储到数据库中，或者 fork 子进程处理，应对资源争抢
      fs.writeFileSync(filePath, num)
    }

    // 增加一个属性值记录次数，便于后文引用
    req.count = num

    next()
  }
}

app.use(count(path.join(__dirname, './count.txt')))

app.get('/', function(req, res) {
  var echo = req.query.echo
  var snippet1 = '<!DOCTYPE html><html><head><title>回声机</title></head><body><span style="color:#ff6600; border:1px solid #ddd;">'
  var snippet2 = '</span></body></html>'
  var snippet3 = ' 回声次数：' + req.count
  var body = snippet1 + '哔哔哔！我听不到你！' + snippet3 + snippet2

  if (echo) {
    echo = xss(echo)

    // 对输入的内容做一些必要的安全过滤
    body = snippet1 + echo + snippet3 + snippet2
  }

  res.send(body)
})

app.listen(3000)

console.log('成功启动服务，端口是 3000')

