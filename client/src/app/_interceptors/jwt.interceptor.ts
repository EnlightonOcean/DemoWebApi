import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountService } from '../_services/account.service';
import { User } from '../_models/user';
import { take } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  currentUser?: User;
  constructor(private accountService: AccountService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // let currentUser: User; // |null = null;
    this.accountService.currentUser$.pipe(take(1)).subscribe(x => this.currentUser = x);
    if (this.currentUser){
      request = request.clone({
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.currentUser.token}`
        })
      });
    }
    return next.handle(request);
  }
}
