'use strict'
var path = require('path')
var util = require("./libs/util")
var wechat_file = path.join(__dirname,'./config/wechat.txt')
var wechat_ticket_file = path.join(__dirname,'./config/wechat_ticket.txt')
var config = {
    wechat:{
        // appId :'wx202962b22e755ab5',
        // appSecret:'d4624c36b6795d1d99dcf0547af5443d',
        appId :'wx0028c0af550b52f3',
        appSecret:'65708fccaaf519270108a02b93500297',
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