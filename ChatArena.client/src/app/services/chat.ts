import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private connection: signalR.HubConnection;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5196/chathub')
      .withAutomaticReconnect()
      .build();
  }

  async start() {
    await this.connection.start();
    console.log('SignalR connected');
  }

  async joinRoom(roomName: string, username: string) {
    await this.connection.invoke('JoinRoom', roomName);
  }

  async sendMessage(roomName: string, username: string, message: string) {
    await this.connection.invoke('SendMessage', roomName, username, message);
  }

  onMessageReceived(callback: (user: string, message: string) => void) {
    this.connection.on('ReceiveMessage', callback);
  }

  onUserJoined(callback: (connectionId: string) => void) {
    this.connection.on('UserJoined', callback);
  }
}
