'use strict'

var Koa = require('koa')
var wechat = require("./wechat/g")
var path = require('path')
var util = require("./libs/util")
var config = require("./config")
var reply = require('./wx/reply')

var app =  new Koa()

app.use(wechat(config.wechat,reply.replay))

app.listen(3000)
console.log('it work 3000')