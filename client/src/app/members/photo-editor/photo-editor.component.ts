import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { Photo } from 'src/app/_models/photo';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {

  @Input() member!: Member;
  uploader?: FileUploader;
  hasBaseDropZoneOver: boolean;
  baseUrl: string;
  user!: User;

  constructor(private accountService: AccountService, private memberService: MembersService) {
    accountService.currentUser$.pipe(take(1)).subscribe( x => {
      this.user = x;
    });
    this.hasBaseDropZoneOver = false;
    this.baseUrl = environment.apiUrl;
  }

  ngOnInit(): void {
    this.initializeUploader();
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  setMainPhoto(photo: Photo): void{
    this.memberService.setMainPhoto(photo.id).subscribe(() => {
      if (this.user)
      {
        this.user.photoUrl = photo.url;
        this.accountService.setCurrentUser(this.user);
        if (this.member){
          this.member.photoUrl = photo.url;
          this.member.photos.forEach( item => {
            if (item.isMain){
              item.isMain = false;
            }
            if (item.id === photo.id){
              item.isMain = true;
            }
          });
        }
      }
    });
  }

  deletePhoto(photo: Photo): void{
    this.memberService.deletePhoto(photo.id).subscribe(() => {
      if (this.member){
        this.member.photos = this.member.photos.filter(x => x.id !== photo.id);
      }
    });
  }

  initializeUploader(): void{
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/add-photo',
      authToken: 'Bearer ' + this.user?.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response){
        const photo: Photo = JSON.parse(response);
        this.member?.photos.push(photo);
        if (photo.isMain){
          this.user.photoUrl = photo.url;
          this.member.photoUrl = photo.url;
          this.accountService.setCurrentUser(this.user);
        }
      }
    };
  }
}
