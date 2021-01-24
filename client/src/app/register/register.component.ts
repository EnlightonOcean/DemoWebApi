import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  model: any = {};
  constructor(private accountService: AccountService, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  register(): void{
    this.accountService.register(this.model).subscribe(x => {
      if (x)
      {
        console.log(x);
      }
      this.cancel();
    }, error => {
        console.log(error);
        this.toastr.error(error.error);
    });
    console.log(this.model);
  }

  cancel(): void{
    console.log('cancelled');
    this.model.username = '';
    this.model.password = '';
    this.cancelRegister.emit(false);
  }

}
