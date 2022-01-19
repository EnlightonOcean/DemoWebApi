import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../modals/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  bsmodalRef?: BsModalRef;
  constructor(private modalService: BsModalService) { }

  confirm(title: string ='Confirmation',
    message = 'Are you sure you want to do this?',
    btnOkText ='Ok',
    btnCancelText ='Cancel'): Observable<boolean> {
      const config={
        initialState: {
          title,
          message,
          btnOkText,
          btnCancelText
        }
      }
      this.bsmodalRef = this.modalService.show(ConfirmDialogComponent,config);
      return new Observable<boolean>(this.getResult());
  }

  private getResult(){
    return (observer: { next: (arg0: any) => void; complete: () => void; }) => {
      const subscription = this.bsmodalRef?.onHidden.subscribe( () => {
        observer.next(this.bsmodalRef?.content.result);
        observer.complete();
      });
      
      return {
        unsubscribe(){
          subscription?.unsubscribe();
        }
      };
    }
  }
}
