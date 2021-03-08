import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceCreatePageComponent } from './invoice-create-page.component';

describe('InvoiceCreatePageComponent', () => {
  let component: InvoiceCreatePageComponent;
  let fixture: ComponentFixture<InvoiceCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceCreatePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
