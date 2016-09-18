'use strict'

var Koa = require('koa')
var wechat = require("./wechat/g")
var path = require('path')
var util = require("./libs/util")
var config = require("./config")
var reply = require('./wx/reply')
var Wechat = require('./wechat/wechat')
var ejs = require('ejs')
var heredoc = require('heredoc')
var crypto = require('crypto')
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
        <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
        <script>
            wx.config({
                debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: 'wx5254ea70a7ec30c7', // 必填，公众号的唯一标识
                timestamp:'<%= timestamp %>', // 必填，生成签名的时间戳
                nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
                signature: '<%= signature %>',// 必填，签名，见附录1
                jsApiList: [
                    "startRecord",
                    "stopRecord",
                    "onVoiceRecordEnd",
                    "onVoicePlayEnd",
                    "uploadVoice",
                    "downloadVoice",
                    "chooseImage",
                    "previewImage",
                    "uploadImage",
                    "downloadImage",
                    "translateVoice"
                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
        </script>
    </body>
</html>
*/})
var app =  new Koa()

var createNoce = function() {
    return Math.random().toString(36).substr(2,15)
}
var createTimestamp = function(){
    return parseInt(new Date().getTime() / 1000,10) + ''
}
function _sign(noncestr,ticket,timestamp,url){
    var params = [
        'noncestr=' + noncestr,
        'jsapi_ticket=' + ticket,
        'timestamp=' +timestamp,
        'url'+url
    ]
    var str = params.sort().join("&")
    var shasum = crypto.createHash('sha1')
    shasum.update(str)
    return shasum.digest('hex')
}
// noncestr=Wm3WZYTPz0wzccnW
// jsapi_ticket=sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg
// timestamp=1414587457
// url=http://mp.weixin.qq.com?params=value
function sign(ticket,url) {
    var noncestr = createNoce();
    var timestamp = createTimestamp();
    console.log(noncestr)
    var signature = _sign(noncestr,ticket,timestamp,url)
    console.log(ticket)
    console.log(url)
    console.log(signature)
    return {
        noncestr:noncestr,
        timestamp:timestamp,
        signature:signature
    }
}
app.use(function *(next){
    if(this.url.indexOf('/movie')> -1) {
        var wechatApi = new Wechat(config.wechat)
        var data = yield wechatApi.fetchAccessToken()
        var access_token = data.access_token
        var ticketData = yield wechatApi.fetchTicket(access_token)
        var ticket = ticketData.ticket
        var url = this.href.replace(":8000",'')
        var params = sign(ticket,url)
        this.body = ejs.render(tpl,params)

        return next
    }
    yield next
})
app.use(wechat(config.wechat,reply.replay))

app.listen(3000)
console.log('it work 3000')