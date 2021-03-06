import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(er => {
        if (er){
          switch (er.status) {
            case 400:
              if (er.error.errors){
                const modalStateErrors = [];
                for (const key in er.error.errors) {
                  if (er.error.errors.hasOwnProperty(key)) {
                    modalStateErrors.push(er.error.errors[key]);
                  }
                }
                throw modalStateErrors.flat();
              }
              else{
                this.toastr.error(er.statusText, er.status);
              }
              break;
            case 401:
              this.toastr.error('UnAuthorized', er.status);
              break;
            case 404:
              this.router.navigateByUrl('/not-found');
              break;
            case 500:
              const navigationExtras: NavigationExtras = {state : {error: er.error}};
              this.router.navigateByUrl('/server-error', navigationExtras);
              break;
            default:
              this.toastr.error('Something unexpected went wrong');
              console.log(er);
              break;
          }
        }
        return throwError(er);
      })
    );
  }
}
