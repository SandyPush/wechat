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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
    </head>
    <body>
        <h1>点击标题开始录音翻译</h1>
        <p id="title"></p>
        <div id="director"></div>
        <div id="year"></div>
        <div id="poster"></div>
        <script src='http://zeptojs.com/zepto.min.js'></script>
        <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
        <script>
            wx.config({
                debug: false, 
                appId: '<%= appId %>', 
                timestamp:'<%= timestamp %>',
                nonceStr: '<%= noncestr %>', 
                signature: '<%= signature %>',
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
                ] 
            })
            wx.ready(function(){

                wx.checkJsApi({
                    jsApiList: ['onVoiceRecordEnd'],
                    success: function(res) {
                        console.log(res)
                    }
                })
                
                var isRecording= false
                $("h1").on('click',function(){
                    if(!isRecording){
                        isRecording = true
                        wx.startRecord({
                            cancel: function(){
                                alert('不能录音了')
                            }
                        })
                        return 
                    }
                    isRecording=false
                    wx.stopRecord({
                        success: function (res) {
                            var localId = res.localId
                            wx.translateVoice({
                               localId: localId,
                                isShowProgressTips: 1, 
                                success: function (res) {
                                    var result = res.translateResult;
                                 //   /v2/movie/search?q=张艺谋 GET /v2/movie/search?tag=喜剧
                                    $.ajax({
                                        type:'get',
                                        url:"https://api.douban.com/v2/movie/search?q="+result,
                                        dataType:'jsonp',
                                        jsonp:'callback',
                                        success:function(data){
                                            var subject = data.subjects[0]
                                            $("#title").html(subject.title)
                                            $("#year").html(subject.year)
                                            $("#director").html(subject.directors[0].name)
                                            $("#poster").html("<img src='"+subject.images.large+"' />")
                                        }
                                    })


                                }
                            })
                        }
                    })

                })

            })

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
        'url='+url
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
        var url = this.href
        var params = sign(ticket,url)
        params.appId = config.wechat.appId
        this.body = ejs.render(tpl,params)

        return next
    }
    yield next
})
app.use(wechat(config.wechat,reply.replay))

app.listen(3000)
console.log('it work 3000')