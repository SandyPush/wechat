'usr strict'
var Promise = require("bluebird")
var _ = require("lodash")
var request = Promise.promisify(require("request"))
var util = require('./util')
var fs = require('fs')
var prefix = "https://api.weixin.qq.com/cgi-bin/"
var mpPrefix = "https://mp.weixin.qq.com/cgi-bin/"
var api = {
    semanticUrl : "https://api.weixin.qq.com/semantic/semproxy/search?",
    accessToken:prefix+"token?grant_type=client_credential",
    temporary: {
        upload:prefix+"media/upload?",
        fetch: prefix+'media/get?'
    },
    permanent: {

        upload:prefix+"material/add_material?",
        fetch: prefix+'material/get_material?',
        uploadNews:prefix+"material/add_news?",
        uploadNewsPic:prefix+"media/uploadimg?",
        del:prefix+'material/del_material?',
        update:prefix+'material/update_news?',
        count:prefix+'material/get_materialcount?',
        betch:prefix+'material/batchget_material?',
        
    },
    group: {
        create:prefix+"groups/create?",
        fetch:prefix+"groups/get?",
        check:prefix+"groups/getid?",
        update:prefix+"groups/update?",
        move:prefix+"groups/members/update?",
        batchupdate:prefix+"groups/members/batchupdate?",
        del:prefix+"groups/delete?",
    },
    user:{
        remark:prefix+ 'user/info/updateremark?',
        fetch:prefix+ 'user/info?',
        batchFetch:prefix+ 'user/info/batchget?',
        list:prefix+ 'user/get?'
    },
    mass:{
    //message/mass/get?access_token=ACCESS_TOKEN
        group:prefix + 'message/mass/sendall?',
        openId:prefix + 'message/mass/send?',
        del:prefix + 'message/mass/delete?',
        preview:prefix + 'message/mass/preview?',
        check:prefix + 'message/mass/get?'
        
    },
    menu:{
        create:prefix + "menu/create?",
        fetch:prefix + "menu/get?",
        del:prefix + "menu/delete?",
        current:prefix + "get_current_selfmenu_info?",
    },
    qrcode:{
        create:prefix + "qrcode/create?",
        show:mpPrefix + "showqrcode?",
    },
    shotUrl: {
        create:prefix+ "shorturl?",
    },
    ticket: {
        get:prefix + 'ticket/getticket?'
    }
    
}
function Wechat(opts){
    var that = this
    this.appId = opts.appId
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.getTicket = opts.getTicket
    this.saveTicket = opts.saveTicket
    this.fetchAccessToken()
}
Wechat.prototype.isValidAccessToken = function (data){
    if (!data || !data.access_token || !data.expires_in) {
        return false
    }

    var access_token = data.access_token
    var expires_in = data.expires_in
    var now = (new Date().getTime())
    if(now<expires_in){
        return true
    }
    else {
        return false
    }
}

Wechat.prototype.updateAccessToken = function (){
    var appId = this.appId
    var appSecret = this.appSecret
    var url = api.accessToken+'&appid='+appId+'&secret='+appSecret
    return new Promise(function(resolve,reject) {
        request({url:url,json:true}).then(function(response) {
            var data = response[1]
            var now = (new Date().getTime())
            var expires_in = now+(data.expires_in-20)*1000
            data.expires_in = expires_in
            resolve(data)
        })
    })
}


Wechat.prototype.fetchAccessToken = function() {
    var that = this
    if(this.access_token && this.expires_in){
        if(this.isValidAccessToken(this)) {
            return Promise.resolve(this)
        }
    }

    return that.getAccessToken()
        .then(function(data){
            try{
                data = JSON.parse(data)

            }
            catch(e) {
                return that.updateAccessToken()
            }
            
            if(that.isValidAccessToken(data)){
                return Promise.resolve(data)
            }
            else {
                return that.updateAccessToken()
            }
        })
        .then(function(data){
            that.saveAccessToken(data)
            return Promise.resolve(data)
        })
}
Wechat.prototype.uploadMaterial = function(type,material,permanent) {
    var that = this
    var form = {}
    var uploadUrl = api.temporary.upload
    if(permanent){
        uploadUrl = api.permanent.upload
        _.extend(form,permanent)
    }
    type = type || 'image'
    if(type =='pic'){
        uploadUrl = api.permanent.uploadNewsPic
    }
    if(type =='news') {
        uploadUrl = api.permanent.uploadNews
        form = material
    }
    else {
        form.media = fs.createReadStream(material)
    }

    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = uploadUrl+'access_token='+data.access_token
                if(!permanent){
                    url+='&type='+type
                }
                else {
                    form.access_token = data.access_token
                }
                var options = {
                    method:'POST',
                    url:url,
                    json:true
                }
                if(type=='news') {
                    options.body = form
                }
                else {
                    options.formData = form
                }
            request(options).then(function(response) {
               var _data = response[1]
              console.log(_data)
               if(_data){
                    resolve(_data)
               }
               else{
                   throw new Error('uploadMaterial matrial error')
               }
            })
            .catch(function(err){
                 reject(err)
            })
        })
    })
}
Wechat.prototype.fetchMaterial = function(mediaId,type,permanent) {
    var that = this
    var form = {}
    var fetchUrl = api.temporary.fetch
    if(permanent){
        fetchUrl = api.permanent.fetch
    }

    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var form = {}
                var url = fetchUrl+'access_token='+data.access_token
                var options = {method:'POST',url:url,json:true}
                 if(permanent){
                    form.media_id=mediaId,
                    form.access_token = data.access_token,
                    options.body = form
                 }
                 else{
                    if(type=='video'){
                        url = url.replace('https://','http://')
                    }
                     url +='&media_id='+mediaId
                 }
                if(type==='news' || type==='video'){
                    request(options).then(function(response) {
                       var _data = response[1]
                       if(_data){
                            resolve(_data)
                       }
                       else{
                           throw new Error('fetchMaterial matrial error')
                       }
                    })
                    .catch(function(err){
                        reject(err)
                    })
                }
                else{
                    resolve(url)
                }
        })
    })
}
Wechat.prototype.deleteMaterial = function(mediaId) {
    var that = this
    var form = {
        media_id:mediaId
    }
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.permanent.del+'access_token='+data.access_token+'&media_id='+mediaId
            
                request({method:'POST',url:url,body:form,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('delete matrial error')
                   }
                })
                .catch(function(err){
                    reject(err)
                })
        })
    })
}

Wechat.prototype.updateMaterial = function(mediaId,news) {
    var that = this
    var form = {
        media_id:mediaId
    }
    _.extend(form,news)
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.permanent.update+'access_token='+data.access_token+'&media_id='+mediaId
                request({method:'POST',url:url,body:form,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                      return  resolve(_data)
                   }
                   else{
                       throw new Error('upload matrial error')
                   }
                })
                .catch(function(err){
                    reject(err)
                })
        })
    })
}
Wechat.prototype.countMaterial = function() {
    var that = this

    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.permanent.count+'access_token='+data.access_token
                request({method:'GET',url:url,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('count matrial error')
                   }
                })
                .catch(function(err){
                    rejact(err)
                })
        })
    })
}

Wechat.prototype.batchMaterial = function(options) {
    var that = this
    
    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 1

    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.permanent.betch+'access_token='+data.access_token
                request({method:'POST',url:url,body:options,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('betch matrial error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.createGroup = function(name) {
    var that = this
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.group.create+'access_token='+data.access_token
                var form = {
                   group:{
                       name:name
                   } 
                }
                request({method:'POST',url:url,body:form,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('betch matrial error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.fetchGroups = function() {
    var that = this


    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.group.fetch+'access_token='+data.access_token

                request({method:'GET',url:url,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('betch group error')
                   }
                })
                .catch(function(err){
                      reject(err)
                })
        })
    })
}
Wechat.prototype.checkGroup = function(openId) {
    var that = this


    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.group.check+'access_token='+data.access_token
                var form = {
                    openid:openId
                }
                request({method:'POST',url:url,body:form,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('check group matrial error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.updateGroup = function(id,name) {
    var that = this


    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.group.update+'access_token='+data.access_token
                var form = {
                    group:{
                        id:id,
                        name:name
                    }
                }
                request({method:'POST',url:url,body:form,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('update group  error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}

Wechat.prototype.moveGroup = function(openIds,to) {
    var that = this
    
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url
                var form = {
                    to_groupid:to
                }
                if(_.isArray(openIds)){
                    url = api.group.batchupdate+'access_token='+data.access_token
                    form.openid_list = openIds
                }
                else {
                    url = api.group.move+'access_token='+data.access_token
                    form.openid = openIds
                }
                request({method:'POST',url:url,body:form,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('move group error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.deleteGroup = function(id) {
    var that = this


    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.group.del+'access_token='+data.access_token
                var form = {
                    group:{
                        id:id,
                    }
                }
                request({method:'POST',url:url,body:form,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('delete group  error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.remarkUser = function(openId,remark) {
    var that = this
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.user.remark+'access_token='+data.access_token
                var form = {
                    "openid":openId,
                    "remark":remark
                }
                request({method:'POST',url:url,body:form,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('delete group  error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.fetchUsers = function(openIds,lang) {
    var that = this
    lang = lang || 'zh-cn'
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url
                var options = {
                    json:true
                }
                if(_.isArray(openIds)){
                    options.url = api.user.batchFetch+'access_token='+data.access_token
                    options.body = {
                        user_list:openIds
                    }
                    options.method='POST'
                }
                else {
                    options.url = api.user.fetch+'access_token='+data.access_token+"&openid="+openIds+'&lang='+lang
                }
                
                request(options).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('delete group  error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.listUsers = function(openId) {
    var that = this
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.user.list+'access_token='+data.access_token
                if(openId){
                    url+='&next_openid'+openid
                }

                request({method:'GET',url:url,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('list user  error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.sendByGroup = function(type,message,groupId) {
    
    var that = this
    var msg = {
        filter:{},
        msgtype:type
    }
    msg[type] = message
    if(!groupId){
        msg.filter.is_to_all = true
    }
    else {
        msg.filter = {
            is_to_all:false,
            group_id:groupId
        }
    }
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.mass.group+'access_token='+data.access_token
                request({method:'POST',url:url,body:msg,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('list user  error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}

Wechat.prototype.sendByOpenId = function(type,message,openIds) {
    var that = this
    var msg = {
        msgtype:type,
        touser:openIds
    }
    msg[type] = message
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.mass.openId+'access_token='+data.access_token
                request({method:'POST',url:url,body:msg,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('send by  id  error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}

//只能删除图文或者视频
Wechat.prototype.deleteMass = function(msgId) {
    var that = this
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.mass.del+'access_token='+data.access_token
                var form = {
                    msg_id:msgId
                }
                request({method:'POST',url:url,body:form,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('send by  id  error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}

Wechat.prototype.previewMass = function(type,message,openId) {
    var that = this
     var msg = {
        msgtype:type,
        touser:openId
    }
    msg[type] = message
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.mass.preview+'access_token='+data.access_token
                request({method:'POST',url:url,body:msg,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('preview  error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}

Wechat.prototype.checkMass = function(msgId) {
    var that = this
    
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.mass.check+'access_token='+data.access_token
                 var form = {
                     msg_id:msgId
                }
                request({method:'POST',url:url,body:form,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('check   error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}

Wechat.prototype.createMenu = function(menu) {
    
  var that = this
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.menu.create+'access_token='+data.access_token
                request({method:'POST',url:url,body:menu,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('menu   error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.fetchMenu = function() {
    
  var that = this
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.menu.fetch+'access_token='+data.access_token
                request({url:url,json:true}).then(function(response) {
                   var _data = response[1]

                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('menu   error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.deleteMenu = function() {
  var that = this
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.menu.del+'access_token='+data.access_token
                request({method:'GET',url:url,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('deleteMenu   error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.getCurrentMenu = function(menu) {
    
  var that = this
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.menu.current+'access_token='+data.access_token
                request({method:'GET',url:url,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('menu   error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.createQrcode = function(qr) {
  var that = this
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.menu.del+'access_token='+data.access_token
                request({method:'GET',url:url,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('deleteMenu   error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.showQrcode = function(ticket){
    return api.qrcode.show+'ticket=' + encodeURI(ticket)
}
Wechat.prototype.createShorurl = function(action,url) {
    urlTypr = action | 'long_url'
    var that = this
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.shotUrl.create+'access_token='+data.access_token
                var form = {
                    action:urlType,
                    long_url:url
                }

                request({method:'POST',body:form,url:url,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('short   error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}
Wechat.prototype.semantic = function(semanticData) {
    var that = this
    return new Promise(function(resolve,reject) {
        that.fetchAccessToken()
            .then(function(data){
                var url = api.semanticUrl+'access_token='+data.access_token
                semanticData.appid = data.appID
                request({method:'POST',body:semanticData,url:url,json:true}).then(function(response) {
                   var _data = response[1]
                   if(_data){
                        resolve(_data)
                   }
                   else{
                       throw new Error('short   error')
                   }
                })
                .catch(function(err){
                     reject(err)
                })
        })
    })
}

Wechat.prototype.fetchTicket = function(access_token) {
    var that = this
    return this.getTicket()
        .then(function(data){
            try{
                data = JSON.parse(data)
            }
            catch(e) {
                return that.updateTicket(access_token)
            }
            
            if(that.isValidTicket(data)){
                return Promise.resolve(data)
            }
            else {

                return that.updateTicket(access_token)
            }
        })
        .then(function(data){
            that.saveTicket(data)
            return Promise.resolve(data)
        })
}
Wechat.prototype.updateTicket = function (access_token){
    var url = api.ticket.get+'&access_token='+access_token+'&type=jsapi'
    return new Promise(function(resolve,reject) {
        request({url:url,json:true}).then(function(response) {
            var data = response[1]
            var now = (new Date().getTime())
            var expires_in = now+(data.expires_in-20)*1000
            data.expires_in = expires_in
            resolve(data)
        })
    })
}
Wechat.prototype.isValidTicket = function (data){
    if (!data || !data.ticket || !data.expires_in) {
        return false
    }
    var ticket = data.ticket
    var expires_in = data.expires_in
    var now = (new Date().getTime())
    if(ticket && now<expires_in){
        return true
    }
    else {
        return false
    }
}


Wechat.prototype.reply = function() {
    var content = this.body
    var message = this.weixin
    var xml = util.tpl(content,message)
    this.status = 200
    this.type = 'application/xml'
    this.body = xml
}

module.exports = Wechat