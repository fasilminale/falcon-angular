export interface FreightOrder {
    freightOrderNumber: string,
      tmsLoadId: string,
      warehouse: string,
      grossWeight: number,
      volume: number,
      pallets: number,
      isDisable?: boolean
}
  