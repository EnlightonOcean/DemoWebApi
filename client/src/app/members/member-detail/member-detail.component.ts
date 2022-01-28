import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
//import { Message } from 'src/app/_models/message';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
//import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';
import { PresenceService } from 'src/app/_services/presence.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('memberTabs', {static: true}) memberTabs!: TabsetComponent;
  member!: Member;
  galleryOptions?: NgxGalleryOptions[];
  galleryImages?: NgxGalleryImage[];
  activeTab!: TabDirective;
  //messages: Message[] = [];
  onlineUsers!: string[];
  user!: User;

  constructor(private presence: PresenceService, private messageService: MessageService,
      private route: ActivatedRoute, private accountService: AccountService,private router: Router) 
  {
      this.accountService.currentUser$.pipe(take(1)).subscribe( x => {
        this.user = x;
      });
      this.router.routeReuseStrategy.shouldReuseRoute = () => false; 
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

  ngOnInit(): void 
  {
    //this.messageService.messageThread$.subscribe(x => this.messages =x);
      this.presence.onlineUsers$.subscribe(x => {
      this.onlineUsers = x;
    })
    // this.loadMember();
    this.route.data.subscribe(x => {
      this.member = x.member;
    });
        
    this.route.queryParams.subscribe(p => {
      p.tab ? this.selectTab(p.tab) : this.selectTab('About ' + this.member.knownAs);
      if(p.tab === "Messages")
      {
        this.messageService.createHubConnection(this.user, this.member.username);
      }
      else
      {
        this.messageService.stopHubConnection();
      }
    });

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ];
    this.galleryImages = this.getImages();

  }

  getImages(): NgxGalleryImage[] {
    const imageUrls: NgxGalleryImage[] = [];
    if (this.member) {
      for (const photo of this.member.photos) {
        imageUrls.push({
          small: photo?.url,
          medium: photo?.url,
          big: photo?.url
        });
      }
    }
    return imageUrls;
  }

  // loadMember(): void {
  //   this.memberService.getMember(this.route.snapshot.paramMap.get('username') ?? '').subscribe(x => {
  //     this.member = x;
  //     this.galleryImages = this.getImages();
  //   });
  // }

  // loadMessages(): void {
  //   this.messageService.getMessageThread(this.member.username).subscribe(x => {
  //     this.messages = x;
  //   });
  // }

  selectTab(tabName: string): void{
    // this.router.navigate([], {
    //     relativeTo: this.route,
    //     queryParams: { tab: tabName }
    // });
    this.memberTabs.tabs.forEach(el => {
      if (el.heading === tabName){
        el.active = true;
      }
    });
  }

  onTabActivated(d: TabDirective): void {
    this.activeTab = d;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: this.activeTab.heading }
  });
    // if (this.activeTab.heading === 'Messages' && this.messages.length === 0) {
    //   // this.loadMessages();
    //   this.messageService.createHubConnection(this.user, this.member.username);
    // }
    // else{
    //   this.messageService.stopHubConnection();
    // }
    
  }

}
