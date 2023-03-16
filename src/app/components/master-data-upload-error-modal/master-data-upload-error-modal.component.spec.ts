import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AppModule} from '../../app.module';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MasterDataUploadErrorModalComponent} from './master-data-upload-error-modal.component';
import {ModalService} from '@elm/elm-styleguide-ui';

describe('MasterDataUploadErrorComponent', () => {
  let component: MasterDataUploadErrorModalComponent;
  let fixture: ComponentFixture<MasterDataUploadErrorModalComponent>;
  let injectedMatDialogRef: MatDialogRef<any>;

  const dialogMock = {
    close: () => {
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [ModalService,
        {provide: MAT_DIALOG_DATA, useValue: {}},
        {provide: MatDialogRef, useValue: dialogMock}]
    })
      .compileComponents();
  });

  beforeEach(() => {
    injectedMatDialogRef = TestBed.inject(MatDialogRef);
    fixture = TestBed.createComponent(MasterDataUploadErrorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log('Testing MasterDataUploadErrorModalComponent');
    expect(component).toBeTruthy();
  });

  it('should download error file', () => {
    const spyObj = jasmine.createSpyObj('a', ['click']);
    spyOn(document, 'createElement').and.returnValue(spyObj);
    const fileName = 'testFileName';
    const data = '123';
    const fileFormat = 'text/csv';
    component.downloadFileFromBase64(fileName, data, fileFormat);

    expect(document.createElement).toHaveBeenCalledTimes(1);
    expect(document.createElement).toHaveBeenCalledWith('a');

    expect(spyObj.href).toBe('data:text/csv;base64,123');
    expect(spyObj.download).toBe(fileName);
    expect(spyObj.click).toHaveBeenCalledTimes(1);
    expect(spyObj.click).toHaveBeenCalledWith();
  });
});
