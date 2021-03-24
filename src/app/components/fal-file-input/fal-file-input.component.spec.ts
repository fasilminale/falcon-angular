import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FalFileInputComponent } from './fal-file-input.component';

describe('FalFileInputComponent', () => {
  let component: FalFileInputComponent;
  let fixture: ComponentFixture<FalFileInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FalFileInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FalFileInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
