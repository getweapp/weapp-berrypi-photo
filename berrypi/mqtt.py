# -*- coding: utf-8 -*-  

# 树莓派照片监控
# 作者：刘焱旺
# 官网：www.getweapp.com
# QQ群：499859691
# 调试过程中有任何问题欢迎和我们联系

import paho.mqtt.client as mqtt
import json

from qiniu import Auth, put_file, etag, urlsafe_base64_encode
import qiniu.config
import os, time

#需要填写你的服务器IP
ip = 'xxx'

#需要填写你的 Access Key 和 Secret Key
access_key = 'xxx'
secret_key = 'xxx'

#构建鉴权对象
q = Auth(access_key, secret_key)

#需要填写你的空间
bucket_name = 'xxx'

#需要填写你的空间域名
base = 'http://xxx'

#照片缓存
cache = ''
lastUpdated = 0

#生成上传 Token，可以指定过期时间等
token = q.upload_token(bucket_name, None, 3600)

def upload(localfile):
    ret, info = put_file(token, None, localfile)
    return ret

# 连接成功回调函数
def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe("CAMERA/PHOTO")

# 消息推送回调函数
def on_message(client, userdata, msg):
    global base, cache, lastUpdated
    print(msg.topic+" "+str(msg.payload))
    if int(time.time()) < lastUpdated + 5:
    	client.publish('CAMERA/PHOTO/BACK', '{"id":"'+str(msg.payload)+'", "path":"'+cache+'"}')
    	return
    r = os.system('fswebcam -r 640*480 imagex01.jpg')
    ret = upload('./imagex01.jpg')
    print ret['hash']
    cache = base+ret['hash']
    lastUpdated = int(time.time())
    client.publish('CAMERA/PHOTO/BACK', '{"id":"'+str(msg.payload)+'", "path":"'+base+ret['hash']+'"}')


if __name__ == '__main__':
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    
    try:
        # 请根据实际情况改变MQTT代理服务器的IP地址
	global ip
        client.connect(ip, 1883, 60)
        client.loop_forever()
    except KeyboardInterrupt:
        client.disconnect()
