'use strict'

module.exports = {
   
     "button":[
     {  
          "type":"click",
          "name":"点击事件",
          "key":"menu_click"
      },
      {
           "name":"点出菜单",
           "sub_button":[
               {  
                   "type":"view",
                   "name":"跳转",
                   "url":"http://www.soso.com/"
                },
                {
                   "type":"scancode_push",
                   "name":"扫码推送事件",
                   "key":"qr_scan"
                },
                {
                   "type":"scancode_waitmsg",
                   "name":"等一下我们",
                   "key":"qr_scan_wait"
                },
                {
                   "type":"pic_sysphoto",
                   "name":"弹出系统拍照",
                   "key":"pic_photo"
                },
                {
                   "type":"pic_photo_or_album",
                   "name":"弹出拍照或者相册",
                   "key":"pic_photo_album",
                   "sub_button": []
                }
            ]
       },
       {
           "name":"点出菜单2",
           "sub_button":[
           {  
               "type":"pic_weixin",
               "name":"微信相册发图fa",
               "key":"pic_weixin"
            },
            {
               "type":"location_select",
               "name":"地理位置获取",
               "key":"location_select"
            },
            // {
            //   "type":"media_id",
            //   "name":"下发图片消息",
            //   "media_id":"xxx"
            // },
            // {
            //   "type":"view_limited",
            //   "name":"跳转图文消息",
            //   "media_id":"XXX"
            // },
            
            ]
       }
       
       ]
 }