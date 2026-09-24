import { Component, OnDestroy, OnInit } from '@angular/core';
import { SupportService } from '../../../core/services/support.service';
import { SocketService } from '../../../core/services/socket.service';
import { ToastService } from '../../../core/services/toast.service';
import { SupportConversation, SupportMessage } from '../../../core/models/models';

@Component({
  selector: 'app-support-chat',
  templateUrl: './support.html',
  standalone: false,
  styleUrl: './support.scss',
})
export class SupportChatComponent implements OnInit, OnDestroy {
  conversations: SupportConversation[] = [];
  active: SupportConversation | null = null;
  messages: SupportMessage[] = [];
  loadingConversations = true;
  loadingMessages = false;
  draft = '';
  sending = false;
  newSubject = '';
  showNewForm = false;
  error = '';
  private onNewMessage?: (data: unknown) => void;

  constructor(
    private support: SupportService,
    private socket: SocketService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.onNewMessage = (data) => this.handleIncoming(data as { conversation: string; message: SupportMessage });
    this.socket.on('support:new_message', this.onNewMessage);
    this.loadConversations();
  }

  loadConversations() {
    this.loadingConversations = true;
    this.error = '';
    this.support.getConversations().subscribe({
      next: (res) => {
        this.conversations = res.data;
        if (this.conversations.length) {
          this.openConversation(this.conversations[0]);
        }
        this.loadingConversations = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load conversations';
        this.loadingConversations = false;
      },
    });
  }

  openConversation(conv: SupportConversation) {
    this.active = conv;
    this.loadingMessages = true;
    this.support.getMessages(conv._id).subscribe({
      next: (res) => {
        this.active = res.data.conversation;
        this.messages = res.data.messages;
        this.loadingMessages = false;
        this.scrollBottom();
      },
      error: () => {
        this.loadingMessages = false;
      },
    });
  }

  send() {
    const body = this.draft.trim();
    if (!body || !this.active) return;
    this.sending = true;
    this.support.sendMessage(this.active._id, body).subscribe({
      next: (res) => {
        this.messages.push(res.data);
        this.draft = '';
        this.sending = false;
        this.scrollBottom();
      },
      error: (err) => {
        this.sending = false;
        this.toast.error(err?.error?.message || 'Failed to send message');
      },
    });
  }

  openNewConversation() {
    const subject = this.newSubject.trim();
    if (!subject) {
      this.toast.info('Please enter a subject');
      return;
    }
    this.support.openConversation(subject).subscribe({
      next: (res) => {
        this.newSubject = '';
        this.showNewForm = false;
        this.conversations.unshift(res.data);
        this.openConversation(res.data);
        this.toast.success('New support conversation opened');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Could not open conversation'),
    });
  }

  private handleIncoming(data: { conversation: string; message: SupportMessage }) {
    if (this.active && data.conversation === this.active._id) {
      this.messages.push(data.message);
      this.scrollBottom();
    } else {
      const conv = this.conversations.find((c) => c._id === data.conversation);
      if (conv) {
        conv.lastMessagePreview = data.message.body;
        conv.lastMessageAt = data.message.createdAt;
        conv.unreadForUser += 1;
      }
      this.toast.info('New support message received');
    }
  }

  private scrollBottom() {
    setTimeout(() => {
      const el = document.getElementById('chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);
  }

  ngOnDestroy() {
    if (this.onNewMessage) this.socket.off('support:new_message', this.onNewMessage);
  }
}