import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceEditPageComponent } from './invoice-edit-page.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('InvoiceEditPageComponent', () => {
  let component: InvoiceEditPageComponent;
  let fixture: ComponentFixture<InvoiceEditPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [ InvoiceEditPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
