import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private baseUrl = 'https://localhost:5001/api/';
  private currentUserSource = new ReplaySubject<User>(1);
  currentUser$ = this.currentUserSource.asObservable();



  constructor(private http: HttpClient) {}

  login(model: any): Observable<any> {
    return this.http.post(this.baseUrl + 'account/login', model).pipe(
      map((response) => {
        const user = response as User;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSource.next(user);
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
         localStorage.setItem('user', JSON.stringify(user));
         this.currentUserSource.next(user);
       }
       return user;
     })
    );
  }

  setCurrentUser(user: User): void{
    this.currentUserSource.next(user);
  }

  logout(): void{
    localStorage.removeItem('user');
    this.currentUserSource.next(undefined);
  }

}
