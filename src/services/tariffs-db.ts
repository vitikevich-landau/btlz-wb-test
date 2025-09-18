import knex from "#postgres/knex.js";
import { parseDecimal } from "./wb-api.js";
import type { WBTariff, TariffRecord } from "#types/wb-api.types.js";
import { Knex } from "knex";

/** Сохраняет или обновляет тарифы в БД */
export async function saveTariffs(date: string, tariffs: WBTariff[]): Promise<void> {
    const records: Omit<TariffRecord, "id" | "created_at" | "updated_at">[] = tariffs.map((tariff) => ({
        date,
        warehouse_name: tariff.warehouseName,
        geo_name: tariff.geoName || null,
        box_delivery_base: parseDecimal(tariff.boxDeliveryBase),
        box_delivery_liter: parseDecimal(tariff.boxDeliveryLiter),
        box_delivery_coef_expr: parseDecimal(tariff.boxDeliveryCoefExpr),
        box_delivery_marketplace_base: parseDecimal(tariff.boxDeliveryMarketplaceBase),
        box_delivery_marketplace_liter: parseDecimal(tariff.boxDeliveryMarketplaceLiter),
        box_delivery_marketplace_coef_expr: parseDecimal(tariff.boxDeliveryMarketplaceCoefExpr),
        box_storage_base: parseDecimal(tariff.boxStorageBase),
        box_storage_liter: parseDecimal(tariff.boxStorageLiter),
        box_storage_coef_expr: parseDecimal(tariff.boxStorageCoefExpr),
    }));

    // Используем транзакцию для атомарности
    await knex.transaction(async (trx: Knex.Transaction) => {
        for (const record of records) {
            await trx("tariffs").insert(record).onConflict(["date", "warehouse_name"]).merge();
        }
    });

    console.log(`Saved ${records.length} tariffs for ${date}`);
}

/** Получает актуальные тарифы для Google Sheets */
export async function getLatestTariffs(): Promise<TariffRecord[]> {
    return knex("tariffs").select("*").where("date", knex("tariffs").max("date")).orderBy("box_delivery_coef_expr", "asc");
}
