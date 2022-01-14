import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Group } from '../_models/group';
import { Message } from '../_models/message';
import { MessageParams } from '../_models/MessageParams';
import { PaginationResult } from '../_models/Pagination';
import { User } from '../_models/user';
import { getPaginatedResult, getParams } from './helper/paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private baseUrl: string = environment.apiUrl;
  private hubUrl: string = environment.hubUrl;
  private hubConnection!: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();

  constructor(private http: HttpClient) { }

  createHubConnection(user: User, otherUserName: string): void
  {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUserName,{
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();
    
    this.hubConnection
      .start()
      .catch(x => console.log(x));
    
    this.hubConnection.on('ReceiveMessageThread',x => {
      this.messageThreadSource.next(x);
    });

    this.hubConnection.on('NewMessage',x => {
      this.messageThread$.pipe(take(1)).subscribe( y => {
        this.messageThreadSource.next([...y, x]);
      })
    });

    this.hubConnection.on('UpdatedGroup',(group: Group) => {
        if(group.connections.some(x => x.username === otherUserName)){
          this.messageThread$.pipe(take(1)).subscribe( messages => {
            messages.forEach( m =>{
              if(!m.dateRead){
                m.dateRead = new Date(Date.now());
              }
            });
            this.messageThreadSource.next([...messages]);
          });
        }
    });
  }

  stopHubConnection(): void
  {
    if(this.hubConnection){
      this.hubConnection.stop().catch(x => console.log(x));
    }
  }

  getMessages(messageParams: MessageParams): Observable<PaginationResult<Message[]>> {
    let params = getParams(messageParams.pageNumber, messageParams.pageSize);
    params = params.append('Container', messageParams.container);
    console.log(params);
    return getPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http);
  }

  getMessageThread(recipient: string): Observable<Message[]> {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + recipient);
  }

  async sendMessage(recipientUserName: string, content: string): Promise<any>{
    // return this.http.post<Message>(this.baseUrl + 'messages/', { recipientUserName, content});
   
      return await this.hubConnection.invoke('SendMessage', { recipientUserName, content })
        .catch(e => console.log(e));
   
  }

  deleteMessage(id: number): Observable<any>{
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
