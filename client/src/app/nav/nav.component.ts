import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};
  constructor(public accountService: AccountService, private router: Router, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.model.username = '';
    this.model.password = '';
   }

  login(): void{
    // console.log(this.model);
    this.accountService.login(this.model).subscribe(x => {
      if (x){
      this.router.navigateByUrl('/members');
      console.log(x);
      }
    }
    // , error => {
    //   // console.log(1);
    //  // console.log(error);
    //   if (error.error.errors){
    //     if (error.error.errors.Password && error.error.errors.UserName)
    //     {
    //       this.toastr.error(error.error.errors.UserName[0] + '\n' + error.error.errors.Password[0]);
    //     }
    //     else if (error.error.errors.Password){
    //       this.toastr.error(error.error.errors.Password[0]);
    //     }
    //     else if (error.error.errors.UserName){
    //       this.toastr.error(error.error.errors.UserName[0]);
    //     }
    //   }
    //   else{
    //     this.toastr.error(error.error);
    //   }
    // }
    );
  }

  logout(): void {
    this.model.username = '';
    this.model.password = '';
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
