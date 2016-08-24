'use strict'

var Koa = require('koa')
var wechat = require("./wechat/g")
var path = require('path')
var util = require("./lib/util")
var wechar_file = path.join(__dirname,'./config/wechat.txt')
var config = {
    wechat:{
        appId :'wx202962b22e755ab5',
        appSecret:'d4624c36b6795d1d99dcf0547af5443d',
        token:'wechat',
        getAccessToken:function(){
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken:function(data){
            data = JSON.stringify(data)
            return util.writeFileAsync(wechar_file,data)
        }
    }   
}

var app =  new Koa()

app.use(wechat(config.wechat))

app.listen(3000)
console.log('it work 3000')