import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatComponent implements OnInit {
  messages: { user: string; text: string }[] = [];
  username: string = '';
  roomName: string = '';
  messageText: string = '';
  joined: boolean = false;

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    await this.chatService.start();

    this.chatService.onMessageReceived((user, message) => {
      this.messages.push({ user, text: message });
      this.cdr.detectChanges(); // tell Angular to re-render
    });
  }

  async joinRoom() {
    await this.chatService.joinRoom(this.roomName, this.username);
    this.joined = true;
  }

  async sendMessage() {
    if (!this.messageText.trim()) return;
    await this.chatService.sendMessage(this.roomName, this.username, this.messageText);
    this.messageText = '';
  }
}
