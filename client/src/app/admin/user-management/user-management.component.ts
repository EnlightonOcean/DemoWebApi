import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RolesModalComponent } from 'src/app/modals/roles-modal/roles-modal.component';
import { User } from 'src/app/_models/user';
import { AdminService } from 'src/app/_services/admin.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {

  users?: Partial<User[]>;
  bsModalRef?: BsModalRef;
  constructor(private adminService: AdminService, private modalService : BsModalService) { }

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  getUsersWithRoles(): void{
    this.adminService.getUsersWithRoles().subscribe( x => this.users = x);
  }

  openRolesModel(user?: User): void{
    const config = {
      class: 'modal-dialog-centered',
      initialState: {
        user,
        roles: this.getRolesArray(user)
      }
    }
    this.bsModalRef = this.modalService.show(RolesModalComponent,config);
    this.bsModalRef.content.updateSelectedRoles.subscribe((values: any) =>{
      const rolesToUpdate ={
        roles: [...values.filter((el: { checked: boolean; }) => el.checked === true)].map(el => el.name)
      }
      if(rolesToUpdate)
      {
        this.adminService.updateUserRoles(user ? user.userName : '', rolesToUpdate.roles).subscribe((x) => {
          if(user){
            user.roles = [...rolesToUpdate.roles];
          }
        });
      }
    });
  }

  private getRolesArray(user?: User): string[]{
    const roles:string[] = [];
    const userRoles = user?.roles;
    const availableRoles: any[] = [
      {name:'Admin',value:'Admin'},
      {name:'Moderator',value:'Moderator'},
      {name:'Member',value:'Member'},
    ];
    availableRoles.forEach(role => {
      let isMatch = false;
      if(userRoles){
        for (const userRole of userRoles) {
          if(role.name == userRole){
            isMatch = true;
            role.checked = true;
            roles.push(role);
            break;
          }
        }
      }
      if(!isMatch){
        role.checked = false;
        roles.push(role);
      }
    });
    return roles;
  }
}
