import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  @Output() cancelRegister = new EventEmitter();
  registerForm: FormGroup;
  maxDate: Date;
  validationErrors: string[] = [];

  constructor(private accountService: AccountService, private toastr: ToastrService,
              private formBuilder: FormBuilder, private router: Router) {
    this.registerForm = this.formBuilder.group({
      gender: ['male'],
      userName: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });

    this.registerForm.controls.password.valueChanges.subscribe(() => {
      this.registerForm.controls.confirmPassword.updateValueAndValidity();
    });
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
}

  ngOnInit(): void { }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      const c = control.parent?.controls as any;
      return (c) ? control?.value === c[matchTo].value ? null : {isNotMatch: true} : null;
    };
  }

  register(): void{
    // console.log(this.registerForm.value);
      this.accountService.register(this.registerForm.value).subscribe(x => {
      this.cancel();
      this.router.navigateByUrl('/members');
    }, e => {
      // console.log(e);
      // this.toastr.error(e.error);
      this.validationErrors = e;
    });
    // this.accountService.register(this.model).subscribe(x => {
    //   if (x)
    //   {
    //     console.log(x);
    //   }
    //   this.cancel();
    // }, error => {
    //     console.log(error);
    //     this.toastr.error(error.error);
    // });
    // console.log(this.model);
  }

  cancel(): void{
    console.log('cancelled');
    this.registerForm.reset();
    // this.model.username = '';
    // this.model.password = '';
    this.cancelRegister.emit(false);
  }

  getControl(controlName: string): FormControl {
    return this.registerForm.controls[controlName] as FormControl;
  }

}
