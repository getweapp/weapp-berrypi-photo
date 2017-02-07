/*
* 树莓派照片监控
* 作者：刘焱旺
* 官网：www.getweapp.com
* QQ群：499859691
* 调试过程中有任何问题欢迎和我们联系
*/

Page({
    data: {
        photo: '',
        open: false
    },
    fetch: function() {
        if(!this.data.open){
            console.log('请稍后再试')
            return
        }
        wx.sendSocketMessage({
            data:JSON.stringify({
                cmd:'BERRY_PI'
            })
        })
    },
    onLoad: function() {
        wx.connectSocket({
            url: 'wss://socket.getweapp.com'
        })

        wx.onSocketOpen((res) => {
            console.log('连接服务器：成功')
            this.setData({
                open: true
            })
        })

        wx.onSocketMessage((res) => {
            console.log('receve:'+res.data)
            console.log(this)
            this.setData({
                photo: JSON.parse(res.data).path
            })
        })

        wx.onSocketClose((res) => {
            console.log('连接服务器：关闭')
            this.setData({
                open: false
            })
            wx.connectSocket({
                url: 'wss://socket.getweapp.com/test'
            })
        })

        wx.onSocketError((res) => {
            console.log('连接服务器：失败')
             this.setData({
                open: false
            })
        })
    }
});
