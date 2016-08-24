'use strict'
var koa = require("koa")
var app = koa()
app.use(function *(){
    var str = this.query.echo
    this.body = str
})
app.listen(3000)
console.log('成功启动服务，端口是3000')