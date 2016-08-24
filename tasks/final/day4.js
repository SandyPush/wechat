'use strict'

var fs = require('fs')
var path = require('path')
var koa = require('koa')
var xss = require('xss')


var app = koa()

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

  return function *count(next) {
    console.log(this.url)

    // 只处理 GET 请求同时去除 favicon 二次请求干扰
    if (this.method === 'GET' && this.url.indexOf('/favicon.ico') === -1) {
      num++

      // 简化难度，以同步的写入，实际线上会存储到数据库中，或者 fork 子进程处理，应对资源争抢
      fs.writeFileSync(filePath, num)
    }

    // 增加一个属性值记录次数，便于后文引用
    this.count = num

    yield* next
  }
}

function time() {
  return function *time(next) {
    // 记录初始时间
    var start = new Date()

    // 暂停并执行 next
    yield next

    // 执行完 next 后记录时间，并打印总用时
    var ms = new Date() - start

    this.set('X-Response-Time', ms + 'ms')
  }
}

// 按中间件加载的顺序执行 generator 函数
app.use(time())
app.use(count(path.join(__dirname, './count.txt')))

app.use(function *() {
  var echo = this.query.echo
  var snippet1 = '<!DOCTYPE html><html><head><title>回声机</title></head><body><span style="color:#ff6600; border:1px solid #ddd;">'
  var snippet2 = '</span></body></html>'
  var snippet3 = ' 回声次数：' + this.count

  if (!echo) {
    this.body = snippet1 + '哔哔哔！我听不到你！' + snippet3 + snippet2
  }
  else {
    echo = xss(echo)

    // 对输入的内容做一些必要的安全过滤
    this.body = snippet1 + echo + snippet3 + snippet2
  }
})

app.listen(3000)

console.log('成功启动服务，端口是 3000')

