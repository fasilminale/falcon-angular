import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableComponent} from '@elm/elm-styleguide-ui';
// import {PaginationModel} from '../../models/table-control/pagination-model';
  import {DateTimeService} from '../../services/date-time-service/date-time-service';
  import {TimeService} from "../../services/time-service";
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {ChilePageComponent} from '../../prototypes/chile-page/chile-page.component';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {FreightOrderModel} from '../../models/freights-loads/freight-order-model';
import {EnvironmentService} from '../../services/environment-service/environment-service';
import {CarrierModel} from "../../models/master-data-lookup/carrier-model";
import {MasterDataLookupService} from "../../services/master-data-lookup-service/master-data-lookup-service";
import {ShippingPointWarehouseModel} from "../../models/master-data-lookup/shipping-point-warehouse-model";
import {PaginationModel} from "../../models/PaginationModel";

@Component({
  selector: 'app-master-data-lookup-page',
  templateUrl: './master-data-lookup-page.component.html',
  styleUrls: ['./master-data-lookup-page.component.scss']
})
export class MasterDataLookupPageComponent extends ChilePageComponent implements OnInit {
  freightSort: {} = {};
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
  lookupGroup: UntypedFormGroup;
  breadcrumbs = [];
  carrierPageState: PaginationModel = new PaginationModel();
  shippingPoints: Array<ShippingPointWarehouseModel> = [];
  shippingPointPageState: PaginationModel = new PaginationModel();
  shippingLookupHeaders = ShippingPointWarehouseModel.shippingLookupHeaders;
  freightOrderHeaders = FreightOrderModel.advancedSearchHeaders;
  freightOrders: Array<FreightOrderModel> = [];
  carriers: Array<CarrierModel> = [];
  showCarriers: Array<CarrierModel> = [];
  selectedCarrier: CarrierModel = new CarrierModel();
  carrierHeaders = CarrierModel.carrierLookupHeaders;
  noResultsMessage = 'Enter search criteria';

  constructor(public dateTimeService: DateTimeService,
              public environmentService: EnvironmentService,
              private masterDataLookupService: MasterDataLookupService,
              public router: Router,
  ) {
    super(dateTimeService, environmentService);
    this.lookupGroup = new UntypedFormGroup({
      selectControl: new UntypedFormControl(),
      searchControl: new UntypedFormControl(),
      shippingControl: new UntypedFormControl(),
      addressControl: new UntypedFormControl(),
      cityControl: new UntypedFormControl(),
      stateControl: new UntypedFormControl(),
      zipControl: new UntypedFormControl(),
      countryControl: new UntypedFormControl()
    });
  }

  ngOnInit(): void {
    this.getCarrierTableData();
  }

  get searchShippingValue(): string {
    return (this.lookupGroup.controls.shippingControl.value ||
      this.lookupGroup.controls.addressControl.value ||
      this.lookupGroup.controls.cityControl.value ||
      this.lookupGroup.controls.stateControl.value ||
      this.lookupGroup.controls.zipControl.value ||
      this.lookupGroup.controls.countryControl.value);
  }

  getCarrierTableData(): void {
    forkJoin([
      this.masterDataLookupService.getCarriersApiCall(),
    ]).subscribe((results) => {
      this.carriers = results[0].carriers;
      this.carrierPageState.totalResults = results[0].total;
      this.updateLastRefresh();
    });
  }

  getCarrier(): void{
    let index = this.carriers.findIndex(
      (carrier) => carrier.scac === this.lookupGroup.controls.selectControl.value);
    this.selectedCarrier = new CarrierModel(this.carriers[index]);
  }

  getShippingPointTableData(): void{
    if (this.searchShippingValue) {
      forkJoin([
        this.masterDataLookupService.getShippingPointApiCall(this.lookupGroup.controls.shippingControl.value,
          this.lookupGroup.controls.addressControl.value,
          this.lookupGroup.controls.cityControl.value,
          this.lookupGroup.controls.stateControl.value,
          this.lookupGroup.controls.zipControl.value,
          this.lookupGroup.controls.countryControl.value),
      ]).subscribe((results) => {
        this.noResultsMessage = 'No Shipping Point Warehouses found.';
        this.shippingPoints = results[0].shippingPoints;
        this.shippingPointPageState.totalResults = results[0].total;
        this.updateLastRefresh();
      });
    }

  }
}
