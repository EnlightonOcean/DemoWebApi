import { Component, OnInit } from '@angular/core';
import { LikesParams } from '../_models/LikesParams';
import { Member } from '../_models/member';
import { Pagination } from '../_models/Pagination';
import { MembersService } from '../_services/members.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {

  members!: Partial<Member[]>;
  likesParams!: LikesParams;
  pagination!: Pagination;
  // predicate = 'liked';

  constructor(private membersService: MembersService) {
    this.likesParams = new LikesParams();
  }

  ngOnInit(): void {
    this.loadLikes();
  }

  loadLikes(): void{
    this.membersService.getLikes(this.likesParams)
      .subscribe((x) =>
      {
        this.members = x.result;
        this.pagination = x.pagination;
      });
  }

  pageChanged(event: any): void {
    this.likesParams.pageNumber = event.page;
    this.loadLikes();
  }
}
