import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Message } from '../_models/message';
import { MessageParams } from '../_models/MessageParams';
import { PaginationResult } from '../_models/Pagination';
import { getPaginatedResult, getParams } from './helper/paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMessages(messageParams: MessageParams): Observable<PaginationResult<Message[]>> {
    let params = getParams(messageParams.pageNumber, messageParams.pageSize);
    params = params.append('Container', messageParams.container);
    console.log(params);
    return getPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http);
  }

  getMessageThread(recipient: string): Observable<Message[]> {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + recipient);
  }

  sendMessage(recipientUserName: string, content: string): Observable<Message>{
    return this.http.post<Message>(this.baseUrl + 'messages/', { recipientUserName, content});
  }

  deleteMessage(id: number): Observable<any>{
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
