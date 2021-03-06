import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';

const httpOptions = {
 headers: new HttpHeaders({
   Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user') ?? '{}')?.token
  })
};

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private baseUrl: string = environment.apiUrl;
  members: Member[] = [];

  constructor(private http: HttpClient) { }

  getMembers(): Observable<Member[]>{
    // return this.http.get<Member[]>(this.baseUrl + 'users', httpOptions);
    // return this.http.get<Member[]>(this.baseUrl + 'users');
    if (this.members.length > 0 ) {
      return of(this.members);
    }
    return this.http.get<Member[]>(this.baseUrl + 'users').pipe(
      map(members => {
        this.members = members;
        return members;
      })
    );
  }

  getMember(username: string): Observable<Member>{
    const member = this.members.find(x => x.username === username);
    if (member) { return of(member); }
    // return this.http.get<Member>(this.baseUrl + 'users/' + username , httpOptions);
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member): Observable<any>{
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

}
