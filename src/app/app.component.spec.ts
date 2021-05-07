import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import {LoadingService} from './services/loading-service';
import {AppModule} from './app.module';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Router} from '@angular/router';

describe('AppComponent', () => {

  let router: Router;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule, AppModule, NoopAnimationsModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        LoadingService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have as title "elm-falcon-ui"', () => {
    expect(component.title).toEqual('elm-falcon-ui');
  });

  it('should not be loading after init', () => {
    expect(component.dataLoading).toEqual(false);
  });

  it('should click provided nav item', () => {
    const navItem = {
      label: 'test',
      click: () => {
      }
    };
    spyOn(navItem, 'click');
    component.navItemClicked(navItem);
    expect(navItem.click).toHaveBeenCalled();
  });

  it('should route from nav buttons', () => {
    spyOn(router, 'navigate').and.stub();
    component.navBarItems.forEach(item => item.click());
    expect(router.navigate).toHaveBeenCalledTimes(component.navBarItems.length);
  });

});
