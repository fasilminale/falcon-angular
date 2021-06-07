import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FalContainerComponent } from './fal-container.component';

describe('FalContainerComponent', () => {
  let component: FalContainerComponent;
  let fixture: ComponentFixture<FalContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FalContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FalContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
