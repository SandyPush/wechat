'use strict'
var path = require('path')
var util = require("./libs/util")
var wechat_file = path.join(__dirname,'./config/wechat.txt')
var wechat_ticket_file = path.join(__dirname,'./config/wechat_ticket.txt')
var config = {
    wechat:{
        appId :'wx202962b22e755ab5',
        appSecret:'d4624c36b6795d1d99dcf0547af5443d',
        // appId :'wx5254ea70a7ec30c7',
        // appSecret:'985767bd8480d56df2966cc61efc0493',
        token:'wechat',
        getAccessToken:function(){
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken:function(data){
            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_file,data)
        },
        getTicket:function(){
            return util.readFileAsync(wechat_ticket_file)
        },
        saveTicket:function(data){
            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_ticket_file,data)
        }
    }   
}

module.exports = config