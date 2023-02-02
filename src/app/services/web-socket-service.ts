import Stomp from 'stompjs'
import SockJS from 'sockjs-client';
import { CustomMessage } from '../models/custom-message';
import { Injectable } from '@angular/core';
import { CustomChat } from '../models/chat';
import {UserService} from './user-service';
import {UserInfoModel} from '../models/user-info/user-info-model';
import {EnvironmentService} from './environment-service/environment-service';

@Injectable()
export class WebSocketService {
    webSocketEndPoint: string = 'http://localhost:8080/ws';
    topic: string = "/user/queue/reply";
    stompClient: any;
    message: CustomMessage[] = [] as any;
    chatList: CustomChat[] = [] as any;
    userInfo: UserInfoModel = new UserInfoModel();

    constructor(private userService: UserService,
                private environmentService: EnvironmentService){
      this.userService.getUserInfo().subscribe(u => {
        this.userInfo = new UserInfoModel(u);
      });
    }

    _connect(topic?: string) {
        console.log("Initialize WebSocket Connection");
        if(topic) {
            this.topic = topic;
        }
        let ws = new SockJS(this.webSocketEndPoint);
        this.stompClient = Stomp.over(ws);
        this.stompClient.connect({ userName: this.userInfo.email }, (frame: any) => {
            this.stompClient.subscribe(this.topic, (event: any) => {
                this.onMessageReceived(event);
            });
            //this.stompClient.reconnect_delay = 2000;
        }, this.errorCallBack);
    };

    _disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
        }
        console.log("Disconnected");
    }

    // on error, schedule a reconnection attempt
    errorCallBack(error: any) {
        console.log("errorCallBack -> " + error)
        setTimeout(() => {
            this._connect();
        }, 5000);
    }

 /**
  * Send message to sever via web socket
  * @param {*} message
  */
    onMessageReceived(message: any) {
        console.log("Message Recieved from Server :: " + message);
    }
}
