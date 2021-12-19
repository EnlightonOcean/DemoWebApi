import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { Pagination } from 'src/app/_models/Pagination';
import { User } from 'src/app/_models/user';
import { UserParams } from 'src/app/_models/UserParams';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {

  members!: Member[];
  pagination!: Pagination;
  userParams!: UserParams;
  // user!: User;
  genderList = [{key: 'Males', value: 'male'}, {key: 'Females', value: 'female'}];

  constructor(private memberService: MembersService ){
    this.userParams = memberService.getUserParams();
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.memberService.getMembers(this.userParams).subscribe(x => {
      this.members = x.result;
      this.pagination = x.pagination;
    });
    this.memberService.setUserParams(this.userParams);
  }

  resetFilters(): void {
    this.userParams = this.memberService.resetUserParams(); // new UserParams(this.user);
    this.loadMembers();
  }

  pageChanged(event: any): void {
    this.userParams.pageNumber = event.page;
    this.loadMembers();
    this.memberService.setUserParams(this.userParams);
  }
}
