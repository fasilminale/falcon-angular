export class PaginationModel {
  pageSizes: Array<number> = [10, 20, 50];
  numberPerPage = 10;
  total = 0;
  pageIndex = 1;
}
