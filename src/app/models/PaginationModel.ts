import {Sort} from '@angular/material/sort';

export class PaginationModel {
  pageSizes: Array<number> = [10, 20, 50, 100];
  numberPerPage = 10;
  total = 0;
  pageIndex = 1;
  sortOrder = '';
  sortField = '';
}
