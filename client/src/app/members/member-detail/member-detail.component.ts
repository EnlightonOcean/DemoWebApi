import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/message';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTabs', {static: true}) memberTabs!: TabsetComponent;
  member!: Member;
  galleryOptions?: NgxGalleryOptions[];
  galleryImages?: NgxGalleryImage[];
  activeTab!: TabDirective;
  messages: Message[] = [];

  constructor(private memberService: MembersService, private messageService: MessageService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // this.loadMember();
    this.route.data.subscribe(x => {
      this.member = x.member;
    });
    this.route.queryParams.subscribe(p => {
      p.tab ? this.selectTab(p.tab) : this.selectTab('About ' + this.member.knownAs);
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

  loadMessages(): void {
    this.messageService.getMessageThread(this.member.username).subscribe(x => {
      this.messages = x;
    });
  }

  selectTab(tabName: string): void{
    this.memberTabs.tabs.forEach(el => {
      if (el.heading === tabName){
        el.active = true;
      }
    });
  }

  onTabActivated(d: TabDirective): void {
    this.activeTab = d;
    if (this.activeTab.heading === 'Messages' && this.messages.length === 0) {
      this.loadMessages();
    }
  }

}
