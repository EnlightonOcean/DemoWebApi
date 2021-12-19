import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LikesParams } from '../_models/LikesParams';
import { Member } from '../_models/member';
import { PaginationResult } from '../_models/Pagination';
import { User } from '../_models/user';
import { UserParams } from '../_models/UserParams';
import { AccountService } from './account.service';
import { getPaginatedResult, getParams } from './helper/paginationHelper';

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
  memberCache = new Map();
  user!: User;
  userParams!: UserParams;

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(x => {
      this.user = x;
      this.userParams = new UserParams(this.user);
    });
  }

  getUserParams(): UserParams {
    return this.userParams;
  }

  setUserParams(userParams: UserParams): void {
    this.userParams = userParams;
  }

  resetUserParams(): UserParams {
    return new UserParams(this.user);
  }

  getMembers(userParams: UserParams): Observable<PaginationResult<Member[]>> {
    const result = this.memberCache.get(Object.values(userParams).join('-'));
    if (result) {
      return of(result);
    }

    // console.log(Object.values(userParams).join('-'));
    let params = getParams(userParams.pageNumber, userParams.pageSize);
    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);
    return getPaginatedResult<Member[]>(this.baseUrl + 'users', params, this.http)
      .pipe(map(x => {
        this.memberCache.set(Object.values(userParams).join('-'), x);
        return x;
      }));
  }

  getMember(username: string): Observable<Member> {
    // console.log(this.memberCache);
    const member = [...this.memberCache.values()]
      .reduce((p, c) => p.concat(c.result), [])
      .find((x: Member) => x.username === username);
    if (member) { return of(member); }
    // console.log(member);
    // const member = this.members.find(x => x.username === username);
    // if (member) { return of(member); }
    // // return this.http.get<Member>(this.baseUrl + 'users/' + username , httpOptions);
    return this.http.get<Member>(this.baseUrl + 'users/' + username);

  }

  updateMember(member: Member): Observable<any> {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number): Observable<any> {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number): Observable<any> {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  addLike(username: string): Observable<any> {
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getLikes(likesParams: LikesParams): Observable<PaginationResult<Member[]>> {
    // return this.http.get(this.baseUrl + 'likes?predicate=' + likesParams);
    // const result = this.memberCache.get(Object.values(likesParams).join('-'));
    // if (result) {
    //   return of(result);
    // }

    let params = getParams(likesParams.pageNumber, likesParams.pageSize);
    params = params.append('predicate', likesParams.predicate);
    console.log(params);
    return getPaginatedResult<Member[]>(this.baseUrl + 'likes', params, this.http)
      .pipe(map(x => {
        // this.memberCache.set(Object.values(likesParams).join('-'), x);
        return x;
      }));
  }

  // private getPaginatedResult<T>(params: HttpParams, controller: string): Observable<PaginationResult<T>> {
  //   const paginatedResult: PaginationResult<T> = new PaginationResult<T>();
  //   return this.http.get<T>(this.baseUrl + controller,
  //     { observe: 'response', params })
  //     .pipe(
  //       map(response => {
  //         if (response.body) {
  //           paginatedResult.result = response.body;
  //         }
  //         if (response.headers.get('Pagination')) {
  //           paginatedResult.pagination = JSON.parse(response.headers.get('Pagination') ?? '{ }');
  //         }
  //         return paginatedResult;
  //       })
  //     );
  // }

  // private getParams(pageNumber: number, pageSize: number): HttpParams {
  //   let params = new HttpParams();
  //   params = params.append('PageNumber', pageNumber.toString());
  //   params = params.append('PageSize', pageSize.toString());
  //   return params;
  // }
}
