import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup} from '@angular/forms';
import {buttonStyleOptions, ConfirmationModalData} from '@elm/elm-styleguide-ui';
import {CommentModalData} from '../../services/util-service';

@Component({
  selector: 'app-fal-comment-modal',
  templateUrl: './fal-comment-modal.component.html',
  styleUrls: ['./fal-comment-modal.component.scss']
})
export class FalCommentModalComponent implements OnInit {

  form: FormGroup;
  primaryButtonStyle: buttonStyleOptions;

  @Output() confirmAction: EventEmitter<any> = new EventEmitter<any>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: CommentModalData, private dialogRef: MatDialogRef<FalCommentModalComponent>) {
    this.form = new FormGroup({
      comment: new FormControl('')
    });
    this.primaryButtonStyle = data.confirmButtonStyle as buttonStyleOptions;
  }

  ngOnInit(): void {
  }

  async confirm(): Promise<void>  {
    this.dialogRef.close(this.form.get('comment')?.value);
  }

}
