'use strict'
var path = require('path')
var util = require("./libs/util")
var wechat_file = path.join(__dirname,'./config/wechat.txt')
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
            return util.writeFileAsync(wechat_file,data)
        }
    }   
}

module.exports = config