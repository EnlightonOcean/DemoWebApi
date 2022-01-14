import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/_models/member';
import { MembersService } from 'src/app/_services/members.service';
import { PresenceService } from 'src/app/_services/presence.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  @Input() member?: Member;
  onlineUsers!: string[];
  
  constructor(private memberService: MembersService, private toastr: ToastrService,
      private presence: PresenceService) { }
      

  ngOnInit(): void {
    this.presence.onlineUsers$.subscribe(x => {
      this.onlineUsers = x;
    })
  }

  addLike(member: Member): void{
    this.memberService.addLike(member.username).subscribe(() => {
      this.toastr.success('You liked ' + member.knownAs);
    });
  }

  isOnline(username: string): boolean{
    if(this.onlineUsers.includes(username))
      return true;
    else
      return false;
  }

}
