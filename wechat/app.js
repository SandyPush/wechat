'use strict'

var Koa = require('koa')
var wechat = require("./wechat/g")
var path = require('path')
var util = require("./libs/util")
var weixin = require("./wx/reply")
var wechar_file = path.join(__dirname,'./config/wechat.txt')
var config = require("./config")

var app =  new Koa()

app.use(wechat(config.wechat,weixin.replay))

app.listen(3000)
console.log('it work 3000')