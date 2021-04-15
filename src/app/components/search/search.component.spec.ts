import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchComponent } from './search.component';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchComponent ],
      imports: [ ReactiveFormsModule, FormsModule ],
      providers: [ FormBuilder ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it( 'should emit an event with the search value', () => {
    const emit = spyOn(component.submitEvent, 'emit');
    component.controlGroup.controls.control.setValue('F0000000001');
    fixture.detectChanges();
    component.submit();
    expect(emit).toHaveBeenCalledWith('F0000000001');
  });
});
