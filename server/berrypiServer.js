/*
* 树莓派照片监控
* 作者：刘焱旺
* 官网：www.getweapp.com
* QQ群：499859691
* 调试过程中有任何问题欢迎和我们联系
*/

import { Server } from 'ws'
import uuid from 'uuid'
import moment from 'moment'

import mqtt from 'mqtt'

const client = mqtt.connect('mqtt://127.0.0.1')

client.on('connect', () => {
	console.log('connected')
	client.subscribe('CAMERA/PHOTO/BACK')
})

client.on('message', (topic, message) => {
	const data = JSON.parse(message.toString())
	console.log(topic, data)
	if(!(data.id in clients)){
		return
	}
	clients[data.id].send(JSON.stringify({
		cmd:"CAMERA/PHOTO",
		path: data.path
	}))
})

const wss = new Server({ port: 3000});

const messages = []

onst BERRY_PI = 'BERRY_PI'
const clients = {}


wss.on('connection', function connection(ws) {
	ws.clientId = uuid.v1()
	clients[ws.clientId] = ws
	console.log('client connected:'+ws.clientId)
  	
	ws.on('message', (message) => {
		try{
		const data = JSON.parse(message)
		switch(data.cmd){
			case BERRY_PI:
				client.publish('CAMERA/PHOTO', ws.clientId)
				return
			default:
				return
		}
		}catch(e){
			console.log(e)
		}
  	})

  	ws.on('close', () => {
		if(ws.clientId)
			delete clients[ws.clientId]
  	})
})

