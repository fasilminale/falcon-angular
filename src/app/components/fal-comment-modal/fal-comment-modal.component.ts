import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {buttonStyle} from '@elm/elm-styleguide-ui';
import {CommentModalData} from '../../services/util-service';

@Component({
  selector: 'app-fal-comment-modal',
  templateUrl: './fal-comment-modal.component.html',
  styleUrls: ['./fal-comment-modal.component.scss']
})
export class FalCommentModalComponent implements OnInit {

  form: UntypedFormGroup;
  primaryButtonStyle: buttonStyle;

  @Output() confirmAction: EventEmitter<any> = new EventEmitter<any>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: CommentModalData, private dialogRef: MatDialogRef<FalCommentModalComponent>) {
    this.form = new UntypedFormGroup({
      comment: new UntypedFormControl('')
    });
    this.primaryButtonStyle = data.confirmButtonStyle as buttonStyle;
  }

  ngOnInit(): void {
  }

  async confirm(): Promise<void>  {
    this.dialogRef.close({ comment: this.form.get('comment')?.value});
  }

}
