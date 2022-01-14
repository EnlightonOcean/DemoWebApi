import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl: string = environment.hubUrl;
  private hubConnection!: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSource.asObservable();

  constructor(private toastr: ToastrService,private router: Router) { }

  createHubConnection(user: User): void{
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence',{
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .catch(x => console.log(x));

    this.hubConnection.on('UserIsOnline',x =>{
      // this.toastr.info(x +' has connected');
      this.onlineUsers$.pipe(take(1)).subscribe(users => {
        this.onlineUsersSource.next([...users, x]);
      });
    });

    this.hubConnection.on('UserIsOffline',username => {
      //this.toastr.warning(x + ' has disconnected');
      this.onlineUsers$.pipe(take(1)).subscribe(users => {
        this.onlineUsersSource.next([...users.filter(x => x !== username )]);
      });
    });

    this.hubConnection.on('GetOnlineUsers', (usernames: string[]) => {
      this.onlineUsersSource.next(usernames);
    });

    this.hubConnection.on('NewMessageRecieved',({username,knownAs}) => {
      this.toastr.info(knownAs + ' has sent you a new message!')
      .onTap.pipe(take(1)).subscribe( () => {
        this.router.navigateByUrl('/members/'+ username +'?tab=Messages')
        // this.router.navigateByUrl('/members', {skipLocationChange: true})
        //     .then(() => {
        //       this.router.navigateByUrl(`/members/${username}?tab=Messages`)
        //     })
      });
    })
  }

  stopHubConnection(): void {
    this.hubConnection.stop().catch(x => console.log(x));
  }


}
