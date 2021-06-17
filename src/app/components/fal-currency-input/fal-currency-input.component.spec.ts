import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FalCurrencyInputComponent, Selectable} from './fal-currency-input.component';

describe('FalCurrencyInputComponent', () => {
  let component: FalCurrencyInputComponent;
  let fixture: ComponentFixture<FalCurrencyInputComponent>;

  function mockSelectable(start: number | null, end: number | null): Selectable {
    return {
      selectionStart: start,
      selectionEnd: end,
      setSelectionRange: jasmine.createSpy()
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FalCurrencyInputComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(FalCurrencyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to initialValue', () => {
    expect(component.value).toEqual('0.00');
  });

  it('when a selection event occurs, should force text cursor to right of prefix', () => {
    spyOn(component, 'forceCursorToRightOfPrefix').and.stub();
    component.onSelectionEvent({target: {}});
    expect(component.forceCursorToRightOfPrefix).toHaveBeenCalled();
  });

  describe('given a prefix of size 1', () => {
    it('should have prefix of size 1', () => {
      // this just makes sure we update the tests if the hard-coded prefix changes
      // all of the other tests in this group assume this prefix length
      expect(component.PREFIX.length).toEqual(1);
    });

    it(', should change 0,0 selection to 1,1', () => {
      const input = mockSelectable(0, 0);
      component.forceCursorToRightOfPrefix(input);
      expect(input.setSelectionRange).toHaveBeenCalledWith(1, 1);
    });

    it(', should change 0,5 selection to 1,5', () => {
      const input = mockSelectable(0, 5);
      component.forceCursorToRightOfPrefix(input);
      expect(input.setSelectionRange).toHaveBeenCalledWith(1, 5);
    });

    it(', should NOT change 1,1 selection', () => {
      const input = mockSelectable(1, 1);
      component.forceCursorToRightOfPrefix(input);
      expect(input.setSelectionRange).not.toHaveBeenCalled();
    });

    it(', should NOT change 5,5 selection', () => {
      const input = mockSelectable(5, 5);
      component.forceCursorToRightOfPrefix(input);
      expect(input.setSelectionRange).not.toHaveBeenCalled();
    });

    it(', should NOT change null,1 selection', () => {
      const input = mockSelectable(null, 1);
      component.forceCursorToRightOfPrefix(input);
      expect(input.setSelectionRange).not.toHaveBeenCalled();
    });

    it(', should NOT change 1,null selection', () => {
      const input = mockSelectable(1, null);
      component.forceCursorToRightOfPrefix(input);
      expect(input.setSelectionRange).not.toHaveBeenCalled();
    });
  });


});
