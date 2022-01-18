import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-fal-delete-modal',
  templateUrl: './fal-delete-modal.component.html',
  styleUrls: ['./fal-delete-modal.component.scss']
})
export class FalDeleteModalComponent implements OnInit {

  deleteReason = '';

  @Output() confirmDelete: EventEmitter<any> = new EventEmitter<any>();

  constructor(private dialogRef: MatDialogRef<FalDeleteModalComponent>) {}

  ngOnInit(): void {
  }

  async confirm(): Promise<void>  {
    this.dialogRef.close(this.deleteReason);
  }

}
