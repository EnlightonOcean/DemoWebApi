import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { MessageParams } from '../_models/MessageParams';
import { Pagination } from '../_models/Pagination';
import { MessageService } from '../_services/message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  messages!: Message[];
  pagination!: Pagination;
  messageParams: MessageParams;
  loading = false;

  constructor(private messageService: MessageService) {
    this.messageParams = new MessageParams();
    // this.messageParams.container = 'Inbox';
  }

  ngOnInit(): void {
    this.getMessages();
  }

  getMessages(): void {
    this.loading = true;
    this.messageService.getMessages(this.messageParams).subscribe(
      x => {
        this.messages = x.result;
        this.pagination = x.pagination;
        this.loading = false;
      });
  }

  pageChanged(event: any): void {
    if (this.messageParams.pageNumber !== event.page) {
      this.messageParams.pageNumber = event.page;
      this.getMessages();
    }
  }

  deleteMessage(id: number): void {
    this.messageService.deleteMessage(id).subscribe(y => {
      this.messages.splice(this.messages.findIndex(x => x.id === id), 1);
    });
  }

}
