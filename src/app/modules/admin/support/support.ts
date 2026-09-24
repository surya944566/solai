import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { SocketService } from '../../../core/services/socket.service';
import { ToastService } from '../../../core/services/toast.service';
import { SupportConversation, SupportMessage } from '../../../core/models/models';

@Component({
  selector: 'app-admin-support',
  templateUrl: './support.html',
  standalone: false,
  styleUrl: './support.scss',
})
export class AdminSupportComponent implements OnInit, OnDestroy {
  conversations: SupportConversation[] = [];
  loading = true;
  error = '';
  active: SupportConversation | null = null;
  messages: SupportMessage[] = [];
  loadingMessages = false;
  draft = '';
  sending = false;
  private onNewMessage?: (data: unknown) => void;
  private onNewConversation?: (data: unknown) => void;

  constructor(
    private admin: AdminService,
    private socket: SocketService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.onNewMessage = (data) => this.handleIncoming(data as { conversation: string; message: SupportMessage });
    this.onNewConversation = (data) => {
      const conv = data as { conversation: SupportConversation };
      if (!this.conversations.some((c) => c._id === conv.conversation._id)) {
        this.conversations.unshift(conv.conversation);
      }
    };
    this.socket.on('support:new_message', this.onNewMessage);
    this.socket.on('support:new_conversation', this.onNewConversation);
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.admin.getConvos({}).subscribe({
      next: (res) => {
        this.conversations = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load conversations';
        this.loading = false;
      },
    });
  }

  openConvo(conv: SupportConversation) {
    this.active = conv;
    this.loadingMessages = true;
    this.admin.getConvo(conv._id).subscribe({
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
    this.admin.sendSupportMessage(this.active._id, body).subscribe({
      next: (res) => {
        this.messages.push(res.data);
        this.draft = '';
        this.sending = false;
        this.scrollBottom();
      },
      error: (err) => {
        this.sending = false;
        this.toast.error(err?.error?.message || 'Failed to send');
      },
    });
  }

  close(conv: SupportConversation) {
    this.admin.closeConvo(conv._id).subscribe({
      next: (res) => Object.assign(conv, res.data),
      error: (err) => this.toast.error(err?.error?.message || 'Failed'),
    });
  }

  block(conv: SupportConversation) {
    if (!confirm(`Block this conversation? The user will be unable to reply.`)) return;
    this.admin.blockConvo(conv._id).subscribe({
      next: (res) => {
        Object.assign(conv, res.data);
        this.toast.success('Conversation blocked');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed'),
    });
  }

  userOf(conv: SupportConversation): string {
    const u = conv.user;
    return typeof u === 'object' && u?.name ? u.name : 'User';
  }

  private handleIncoming(data: { conversation: string; message: SupportMessage }) {
    if (this.active && data.conversation === this.active._id) {
      this.messages.push(data.message);
      this.scrollBottom();
    } else {
      const conv = this.conversations.find((c) => c._id === data.conversation);
      if (conv) {
        conv.lastMessagePreview = data.message.body;
        conv.unreadForAdmin += 1;
      }
    }
  }

  private scrollBottom() {
    setTimeout(() => {
      const el = document.getElementById('admin-chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);
  }

  ngOnDestroy() {
    if (this.onNewMessage) this.socket.off('support:new_message', this.onNewMessage);
    if (this.onNewConversation) this.socket.off('support:new_conversation', this.onNewConversation);
  }
}