import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private baseUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<User>(1);
  currentUser$ = this.currentUserSource.asObservable();



  constructor(private http: HttpClient, private presence: PresenceService) {}

  login(model: any): Observable<any> {
    return this.http.post(this.baseUrl + 'account/login', model).pipe(
      map((response) => {
        const user = response as User;
        if (user) {
          this.setCurrentUser(user);
          this.presence.createHubConnection(user);
        }
        return user;
      })
    );
  }

  register(model: any): Observable<any>{
    return this.http.post(this.baseUrl + 'account/register', model).pipe(
     map((x) => {
       const user = x as User;
       if (user) {
          this.setCurrentUser(user);
          this.presence.createHubConnection(user);
       }
       return user;
     })
    );
  }

  setCurrentUser(user: User): void{
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout(): void{
    localStorage.removeItem('user');
    //this.currentUserSource.next(null);
    this.currentUserSource = new ReplaySubject<User>(1)
    this.currentUser$ = this.currentUserSource.asObservable();
    this.presence.stopHubConnection();
  }

  getDecodedToken(token: string){
    return JSON.parse(atob(token.split('.')[1]));
  }

}
