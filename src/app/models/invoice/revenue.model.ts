import { CarrierRate } from "../rate-engine/rate-engine-request";

export interface Revenue {
    customer: string;
    rate: CarrierRate;
}

export interface RevenueTotal {
    customer: string;
    value: number;
}
