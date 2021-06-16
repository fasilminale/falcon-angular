import {TestBed} from '@angular/core/testing';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {UtilService} from './util-service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {SubscriptionManager} from './subscription-manager';

describe('SubscriptionManager Tests', () => {

  let subscriptionManager: SubscriptionManager;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [SubscriptionManager],
      schemas: []
    }).compileComponents();
    subscriptionManager = TestBed.inject(SubscriptionManager);
  });

  it('should create', () => {
    expect(subscriptionManager).toBeTruthy();
  });

  it('should start empty', () => {
    expect(subscriptionManager.getSubscriptions.length).toEqual(0);
  });

});
