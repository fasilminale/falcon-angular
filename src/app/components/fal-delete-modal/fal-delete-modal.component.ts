import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-fal-delete-modal',
  templateUrl: './fal-delete-modal.component.html',
  styleUrls: ['./fal-delete-modal.component.scss']
})
export class FalDeleteModalComponent implements OnInit {

  form: FormGroup;

  @Output() confirmDelete: EventEmitter<any> = new EventEmitter<any>();

  constructor(private dialogRef: MatDialogRef<FalDeleteModalComponent>) {
    this.form = new FormGroup({
      deleteReason: new FormControl('')
    });
  }

  ngOnInit(): void {
  }

  async confirm(): Promise<void>  {
    this.dialogRef.close(this.form.get('deleteReason')?.value);
  }

}
