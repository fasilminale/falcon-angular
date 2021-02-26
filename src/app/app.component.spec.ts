import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'elm-falcon-ui'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('elm-falcon-ui');
  });

  it(`should not be loading after init`, () => {
    // falcon does not currently support loading spinners
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.ngOnInit();
    expect(app.dataLoading).toEqual(false);
  });

});
