import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FalNewChargeModalComponent} from './fal-new-charge-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SubjectValue} from '@elm/elm-styleguide-ui';

fdescribe('FalCommentModalComponent', () => {

  let component: FalNewChargeModalComponent;
  let fixture: ComponentFixture<FalNewChargeModalComponent>;
  let afterClosed$: SubjectValue<any>;
  let MOCK_DIALOG: any;

  beforeEach(async () => {
    afterClosed$ = new SubjectValue<any>(false);
    MOCK_DIALOG = {
      close: () => {
      },
      afterClosed: () => afterClosed$.asObservable(),
    };
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [FalNewChargeModalComponent],
      providers: [
        {provide: MatDialogRef, useValue: MOCK_DIALOG},
        {provide: MAT_DIALOG_DATA, useValue: {}}
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(FalNewChargeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should confirm', () => {
    spyOn(MOCK_DIALOG, 'close');
    component.confirm();
    expect(MOCK_DIALOG.close).toHaveBeenCalled();
  });
});
