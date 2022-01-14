import { Component, OnInit } from '@angular/core';
import { User } from './_models/user';
import { AccountService } from './_services/account.service';
import { PresenceService } from './_services/presence.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Demo Api App';
  users: any;

  constructor(private accountService: AccountService, private presence: PresenceService) {}

  ngOnInit(): void {
    this.setCurrentUser();
  }

  setCurrentUser(): void{
    const temp: string | null = localStorage.getItem('user');
    if (temp)
    {
      const user: User = JSON.parse(temp);
      this.accountService.setCurrentUser(user);
      this.presence.createHubConnection(user);
    }
  }



}

