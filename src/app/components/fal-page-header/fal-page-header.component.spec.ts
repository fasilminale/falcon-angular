import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FalPageHeaderComponent} from './fal-page-header.component';
import {NavigationModule} from '@elm/elm-styleguide-ui/lib/components/navigation/navigation.module';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {By} from '@angular/platform-browser';

describe('FalPageHeaderComponent', () => {
  let component: FalPageHeaderComponent;
  let fixture: ComponentFixture<FalPageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FalPageHeaderComponent],
      imports: [NavigationModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FalPageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('help link', () => {
    it('should be visible when given a helpUrl', () => {
      component.helpUrl = 'test';
      fixture.detectChanges();
      const link = fixture.debugElement.query(By.css('#help-link'));
      const button = fixture.debugElement.query(By.css('#help-btn'));
      expect(link).not.toBeNull();
      expect(button).toBeNull();
    });

    it('should override the button when both are given', () => {
      component.helpUrl = 'test';
      component.forceHelpButton = true;
      fixture.detectChanges();
      const link = fixture.debugElement.query(By.css('#help-link'));
      const button = fixture.debugElement.query(By.css('#help-btn'));
      expect(link).not.toBeNull();
      expect(button).toBeNull();
    });

    it('should emit when clicked', () => {
      const emitEventSpy = spyOn(component.helpRequested, 'emit');
      component.helpUrl = 'test';
      fixture.detectChanges();
      const link = fixture.debugElement.query(By.css('#help-link'));
      link.nativeElement.click();
      expect(emitEventSpy).toHaveBeenCalled();
    });
  });

  describe('help button', () => {
    it('should be visible when forceHelpButton = true and a help URL is not given', () => {
      component.forceHelpButton = true;
      fixture.detectChanges();
      const link = fixture.debugElement.query(By.css('#help-link'));
      const button = fixture.debugElement.query(By.css('#help-btn'));
      expect(link).toBeNull();
      expect(button).not.toBeNull();
    });

    it('should emit when clicked', () => {
      const emitEventSpy = spyOn(component.helpRequested, 'emit');
      component.forceHelpButton = true;
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('#help-btn'));
      button.triggerEventHandler('buttonClick', new Event('click'));
      expect(emitEventSpy).toHaveBeenCalled();
    });
  });
});
