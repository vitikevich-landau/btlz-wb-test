export interface WBTariff {
    warehouseName: string;
    geoName?: string;
    boxDeliveryBase?: string;
    boxDeliveryLiter?: string;
    boxDeliveryCoefExpr?: string;
    boxDeliveryMarketplaceBase?: string;
    boxDeliveryMarketplaceLiter?: string;
    boxDeliveryMarketplaceCoefExpr?: string;
    boxStorageBase?: string;
    boxStorageLiter?: string;
    boxStorageCoefExpr?: string;
}

export interface WBApiResponse {
    response: {
        data: {
            dtNextBox?: string;
            dtTillMax?: string;
            warehouseList: WBTariff[];
        };
    };
}

export interface TariffRecord {
    id?: number;
    date: string;
    warehouse_name: string;
    geo_name?: string | null;
    box_delivery_base?: number | null;
    box_delivery_liter?: number | null;
    box_delivery_coef_expr?: number | null;
    box_delivery_marketplace_base?: number | null;
    box_delivery_marketplace_liter?: number | null;
    box_delivery_marketplace_coef_expr?: number | null;
    box_storage_base?: number | null;
    box_storage_liter?: number | null;
    box_storage_coef_expr?: number | null;
    created_at?: Date;
    updated_at?: Date;
}
