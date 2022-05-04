import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FalAccessorialDetailComponent } from './fal-accessorial-detail.component';

describe('FalAccessorialDetailComponent', () => {
  let component: FalAccessorialDetailComponent;
  let fixture: ComponentFixture<FalAccessorialDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FalAccessorialDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FalAccessorialDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
