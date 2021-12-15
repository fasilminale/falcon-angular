export interface Measurement {
  value: number;
  unitOfMeasure: UnitOfMeasure;
  givenUnitOfMeasure: string;
}

export enum UnitOfMeasure {
  FT = 'FT',
  LB = 'LB',
  UNIT = 'UNIT'
}
