import { Component } from '@angular/core';
import { Paho } from 'ng2-mqtt/mqttws31';



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  client;
  estado = 0
  temperatura: any;
  humedad: any;
  constructor() {
    this.client = new Paho.MQTT.Client('192.168.88.96', 9001, '', this.makeid(20));
    this.onMessage();
    this.onConnectionLost();
    this.client.connect({ onSuccess: this.onConnected.bind(this) });
    //this.luces()

  }

  onMessage() {
    this.client.onMessageArrived = (message: Paho.MQTT.Message) => {
      if (message.destinationName == "/home/temp" && message.payloadString != "Conectado") {
        this.temperatura = message.payloadString
      } else if (message.destinationName == "/home/hum" && message.payloadString != "Conectado") {
        this.humedad = message.payloadString
      } else if (message.destinationName == "/home/luz" ) {
        console.log(message.payloadString)
        let message2 = (message.payloadString === '0' ? 0 : 1)
        this.estado = message2
      }
    };
  }

  onConnectionLost() {
    this.client.onConnectionLost = (responseObject: Object) => {
      console.log('Connection lost : ' + JSON.stringify(responseObject));
    };
  }

  onConnected() {
    console.log("Connected");
    this.client.subscribe("/home/temp");
    this.client.subscribe("/home/hum")
    this.client.subscribe("/home/luz");

    this.luces()

  }

  luces() {
    let message = (this.estado === 0 ? 1 : 0)
    this.estado = message
    let packet = new Paho.MQTT.Message(message.toString());
    packet.destinationName = "/home/luz";
    this.client.send(packet);
  }

  makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
}
