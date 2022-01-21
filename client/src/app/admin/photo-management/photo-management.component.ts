import { Component, OnInit } from '@angular/core';
import { Photo } from 'src/app/_models/photo';
import { AdminService } from 'src/app/_services/admin.service';

@Component({
  selector: 'app-photo-management',
  templateUrl: './photo-management.component.html',
  styleUrls: ['./photo-management.component.css']
})
export class PhotoManagementComponent implements OnInit {
  photos!: Photo[]; 
  constructor(private adminService: AdminService) { 
  }

  ngOnInit(): void {
    this.getPhotosForApproval();
  }

  getPhotosForApproval():void
  {
    this.adminService.getPhotosForApproval().subscribe(x => this.photos=x);
  }

  moderatePhoto(photoId: number,actionType: string):void
  {
    switch (actionType) {
      case "Approve":
        this.adminService.approvePhoto(photoId).subscribe(()=>{
          this.photos.splice(this.photos.findIndex(x => x.id === photoId),1);
        });
        break;
      case "Reject":
        this.adminService.rejectPhoto(photoId).subscribe(() => {
          this.photos.splice(this.photos.findIndex(x => x.id === photoId),1);
        });
        break;
      default:
        break;
    }
  }
}
