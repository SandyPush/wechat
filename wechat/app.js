'use strict'

var Koa = require('koa')
var wechat = require("./wechat/g")
var path = require('path')
var util = require("./libs/util")
var config = require("./config")
var reply = require('./wx/reply')

var ejs = require('ejs')
var heredoc = require('heredoc')

var tpl = heredoc(function(){/*
<!DOCTYPE html>
<html>
    <head>
        <title>猜电影</title>
        <meta name="viewport" content="inital-scale=1,maximum-scale=1,minmun-scale=1" />
    </head>
    <body>
        <h1>点击标题开始录音翻译</h1>
        <p id="poster"></p>
        <div id="poster"></div>
        <script src='http://zeptojs.com/zepto.min.js'></script>
        <script src=""></script>
    </body>
</html>
*/})
var app =  new Koa()
app.use(function *(next){
    if(this.url.indexOf('/movie')> -1) {
        this.body = ejs.rander(tpl,{})
        return next
    }
    yield next
})
app.use(wechat(config.wechat,reply.replay))

app.listen(3000)
console.log('it work 3000')