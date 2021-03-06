import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-errors',
  templateUrl: './test-errors.component.html',
  styleUrls: ['./test-errors.component.css']
})
export class TestErrorsComponent implements OnInit {
  baseUrl = 'https://localhost:5001/api/';
  validationErrors: string[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  get404Error(): void{
    this.http.get(this.baseUrl + 'buggy/not-found').subscribe(x => {
      console.log(x);
    },
      er => {
        console.log(er);
      });
  }

  get400Error(): void {
    this.http.get(this.baseUrl + 'buggy/bad-request').subscribe(x => {
      console.log(x);
    },
      er => {
        console.log(er);
      });
  }

  get500Error(): void {
    this.http.get(this.baseUrl + 'buggy/server-error').subscribe(x => {
      console.log(x);
    },
      er => {
        console.log(er);
      });
  }

  get401Error(): void {
    this.http.get(this.baseUrl + 'buggy/auth').subscribe(x => {
      console.log(x);
    },
      er => {
        console.log(er);
      });
  }

  get400ValidationError(): void {
    this.http.post(this.baseUrl + 'account/register', {}).subscribe(x => {
      console.log(x);
    },
      er => {
        console.log(er);
        this.validationErrors = er;
      });
  }
}
