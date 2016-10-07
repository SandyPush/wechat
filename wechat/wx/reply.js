'use strict'
var config = require("../config")
var path = require("path")
var Wechat = require("../wechat/wechat")

var menu = require("./menu")
var wechatApi = new Wechat(config.wechat)

exports.replay = function* (next) {
    // wechatApi.deleteMenu()
    // .then(function(){
    //     return wechatApi.createMenu(menu)
    // })
    // .then(function(msg){
    //     console.log(msg)
    //     console.log('更新菜单')
    // })
    var message = this.weixin
    if(message.MsgType ==='event') {
        if(message.Event ==='subscribe') {
            if(message.EventKey) {
                console.log('扫描二维码：' + message.EventKey+ ' ' +message.ticket)
            }
            console.log('订阅')
            this.body = "订阅"
        }
        else if (message.Event ==='unsubscribe') { 
            console.log('取消订阅')
            this.body=''
        }
        else if (message.Event ==='LOCATION') {
            this.body = '您上报的位置是：'+ message.Latitude+'/'+message.Longitude+'-'+message.Precision
        }
        else if (message.Event==='CLICK') {
            this.body='您点击了菜单：'+message.EventKey
        }
        else if (message.Event==='SCAN') {
            console.log('关注后扫二外吗'+message.EventKey+ ''+message.Ticket)
            this.body = '扫描了'
        }
        else if(message.Event==='VIEW') {
            this.body='您点击了菜单中的链接：'+message.EventKey
        }
        else if(message.Event==='scancode_push') {
            console.log(message.ScanCodeInfo.ScanType)
            console.log(message.ScanResult.ScanResult)
            this.body='您点击了菜单中的链接：'+message.EventKey
        }
        else if(message.Event==='scancode_waitmsg') {
            console.log(message.ScanCodeInfo.ScanType)
            console.log(message.ScanResult.ScanResult)
            this.body='您点击了菜单中的链接：'+message.EventKey
        }
        else if(message.Event==='pic_sysphoto') {
            console.log(message.SendPicsInfo.Count)
            console.log(message.SendPicsInfo.PicList)
            this.body='您点击了菜单中的链接：'+message.EventKey
        }
        else if(message.Event==='pic_photo_or_album') {
            console.log(message.SendPicsInfo.Count)
            console.log(message.SendPicsInfo.PicList)
            this.body='您点击了菜单中的链接：'+message.EventKey
        }
        else if(message.Event==='image') {
            console.log(message.MediaId)
            console.log(message.PicUrl)
            this.body='您点击了菜单中的链接：'
        }

    }
    else if(message.MsgType ==='text') {
        var content = message.Content
        var replay = '额，订到了：'+message.Content
        if(content==='1'){
            replay='第一'
        }
        else if(content=='2'){
            replay='第二'
        }
        else if(content=='3'){
            replay='第三'
        }
        else if(content ==='4'){
            replay = [{
                title:'理财产品',
                description:'你跳赵丹，我牵着马，淫来日出，送走晚霞',
                picUrl:'https://sf-sponsor.b0.upaiyun.com/98cb96a204439b84b0e0f3d439559c7d.jpeg',
                url:'http://www.baidu.com'
            },
            {
                title:'大河向东',
                description:'你跳赵丹，我牵着马，淫来日出，送走晚霞',
                picUrl:'https://sf-sponsor.b0.upaiyun.com/98cb96a204439b84b0e0f3d439559c7d.jpeg',
                url:'http://www.goole.com'
            },
            ]
        }
        else if(content=='5'){
            var data = yield wechatApi.uploadMaterial('',path.join(__dirname,'../2.jpg'))
            replay = {
                type:'image',
                mediaId:data.media_id
            }
        }
        else if(content=='6'){
            var data = yield wechatApi.uploadMaterial('video',path.join(__dirname,'../6.mp4'))
            replay = {
                type:'video',
                mediaId:data.media_id,
                title:'视频',
                description:'描述'
            }
        }
        else if(content=='7'){
            var data = yield wechatApi.uploadMaterial('image',path.join(__dirname,'../6.mp4'))
            console.log(data)
            replay = {
                type:'music',
                title:'音乐',
                description:'小小的一个音乐',
                musicUrl:'http://my-wechat.p.imooc.io/wechat/%E5%A5%BD%E5%8F%AF%E6%83%9C-%E5%BA%84%E5%BF%83%E5%A6%8D.mp3',
                thumbMediaId:data.media_id
            }
        }
        else if(content=='8'){
            var data = yield wechatApi.uploadMaterial('image',path.join(__dirname,'../2.jpg'),{type:'image'})
            console.log(data)
            replay = {
                type:'image',
                mediaId:data.media_id
            }
        }
        else if(content=='9'){
            var data = yield wechatApi.uploadMaterial('video',path.join(__dirname,'../6.mp4'),{type:'video',description:'{"title":"爱空间恢复到健康和","intr"}'})
            console.log(data)
            replay = {
                type:'video',
                mediaId:data.media_id,
                title:'视频',
                description:'描述'
            }
        }
        else if(content=='10'){
            var picData = yield wechatApi.uploadMaterial('image',path.join(__dirname,'../2.jpg'),{})
            var media = {
                "articles": [
                    {
                        title: 'TITLE',
                        thumb_media_id: picData.media_id,
                        author: 'AUTHOR',
                        digest: 'DIGEST',
                        show_cover_pic: 1,
                        content: 'CONTENT',
                        content_source_url: 'http://www.baidu.com'
                    },
                    {
                        title: 'TITLE1',
                        thumb_media_id: picData.media_id,
                        author: 'AUTHOR',
                        digest: 'DIGEST',
                        show_cover_pic: 1,
                        content: 'CONTENT',
                        content_source_url: 'http://www.baidu.com'
                    }
                ]
            }
            data = yield wechatApi.uploadMaterial('news',media,{})
            data = yield wechatApi.fetchMaterial(data.media_id,'news',{})
            console.log(data)
            var items = data.news_item
            var news = []
            if(items){
                items.forEach(function(item){
                    news.push({
                        title:item.title,
                        description:item.digest,
                        picUrl:picData.url,
                        url:item.url
                    })
                })
                replay = news
            }
            
        }
        else if(content=='11'){
            var counts = yield wechatApi.countMaterial()
         
            var results = yield [
                // wechatApi.batchMaterial({
                //     type:'image',
                //     offset :0,
                //     count: 10
                // }),
                // wechatApi.batchMaterial({
                //     type:'video',
                //     offset :0,
                //     count: 10
                // }),
                // wechatApi.batchMaterial({
                //     type:'voice',
                //     offset :0,
                //     count: 10
                // }),
                wechatApi.batchMaterial({
                    type:'news',
                    offset :0,
                    count: 10
                })
                
            ]
            console.log(JSON.stringify(results))
            replay = "分组信息"
        }
        else if(content ==='12') {
            var  group = yield wechatApi.createGroup('wechat')
            console.log('新分组 wechat')
            console.log(group)
            var groups = yield wechatApi.fetchGroups()
            console.log('加了分组列表')
            console.log(groups)
            var group2 = yield wechatApi.checkGroup(message.FromUserName)
            console.log("查看自己的分组")
            console.log(group2)
            var result2 =  yield wechatApi.moveGroup(message.FromUserName,100)
            console.log('移动到100')
            var groups20 = yield wechatApi.fetchGroups()
             console.log(groups20)
             var result3 =  yield wechatApi.moveGroup([message.FromUserName],102)
            console.log('批量移动到102')
             var groups21 = yield wechatApi.fetchGroups()
             console.log(groups21)
             var result4 = yield wechatApi.updateGroup(101,'nowWechat')
             console.log('修改组名：nowWechat')
             console.log(result4)
             var groups22 = yield wechatApi.fetchGroups()
             console.log(groups22)
             var result5 = yield wechatApi.deleteGroup(103)
             console.log('删除一个wechat分组')
             console.log(result5)
             var groups23= yield wechatApi.fetchGroups()
             console.log(groups23)
            replay = 'group done'
        }
        else if(content==='13') {
            var user = yield wechatApi.fetchUsers(message.FromUserName)
            console.log(user)
            var openIds = [
                    {
                        openid:message.FromUserName,
                        lang:'en'
                    }
                ]
            var users = yield wechatApi.fetchUsers(openIds)
            console.log(users)
            replay = JSON.stringify(users)
        }
        else if(content==='14'){
            var userList = yield wechatApi.listUsers()
            console.log(userList)
            replay = userList.total
        }
        else if(content==='15'){
            var mpnews = {
                media_id:'a3PVUV0h7P6Ib_GUWrcfnXQ4KDf5148qm2OKybZawqM'
            }
            var text = {
              "content":"群发文本消息"
           }
            var msgData = yield wechatApi.sendByGroup('text',text,102)
            console.log(msgData)
            replay = "OK"
            
        }
        else if(content==='16'){
            var mpnews = {
                media_id:'a3PVUV0h7P6Ib_GUWrcfnXQ4KDf5148qm2OKybZawqM'
            }
            var text = {
              "content":"群发文本消息"
           }
            var msgData = yield wechatApi.previewMass('mpnews',mpnews,"or5f8w_SJ47ABRQlxFTfmh1TJuhA")
            console.log(msgData)
            replay = "OK"
            
        }
        else if(content==='17'){
            var msgData = yield wechatApi.checkMass("6322690570575301325")
            console.log(msgData)
            replay = "测试消息有没有发送成功"
            
        }
        else if(content ==='18'){
            //{"expire_seconds": 604800, "action_name": "QR_SCENE", "action_info": {"scene": {"scene_id": 123}}}
            var tempQr = {
                expire_seconds:400000,
                action_name:'QR_SCENE',
                action_info:{
                    scene:{
                       scene_id:'123' 
                    }
                }
            }
            var permQr = {
                expire_seconds:400000,
                action_name:'QR_LIMIT_SCENE',
                action_info:{
                    scene:{
                       scene_id:123
                    }
                }
            }
            var permStrQr = {
                expire_seconds:400000,
                action_name:'QR_LIMIT_STR_SCENE',
                action_info:{
                    scene:{
                       scene_id:'ABC' 
                    }
                }
            }
            var qr1 = yield wechatApi.createQrcode(tempQr)
            var qr1 = yield wechatApi.createQrcode(permQr)
            var qr1 = yield wechatApi.createQrcode(permStrQr)
        }
        else if(content ==='19') {
            var longUrl = 'http://ww.imooc.com/'
            var shotData = yield wechatApi.createShorurl('long2short',longUrl);
        }
        else if(content ==='20'){
            var semanticData = {
                "query":"寻龙诀",
                "city":"北京",
                "category": "movie",
                "uid":message.FromUserName
            }
            var _semanticData = yield wechatApi.semantic(semanticData)
            replay = JSON.stringify(_semanticData)
        }

        this.body=replay
    }
    yield next
}