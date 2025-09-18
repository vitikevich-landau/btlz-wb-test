import { google, sheets_v4 } from "googleapis";
import env from "#config/env/env.js";
import { getLatestTariffs } from "./tariffs-db.js";
import type { TariffRecord } from "#types/wb-api.types.js";

const SHEET_NAME = "stocks_coefs";

/** Получает ID таблиц из переменной окружения */
export function getSheetIds(): string[] {
    if (!env.GOOGLE_SHEET_IDS) {
        console.log("No GOOGLE_SHEET_IDS configured");
        return [];
    }
    return env.GOOGLE_SHEET_IDS.split(",")
        .map((id) => id.trim())
        .filter(Boolean);
}

/** Инициализирует Google Sheets API */
function getGoogleAuth() {
    if (!env.GOOGLE_SHEETS_CREDENTIALS) {
        console.log("GOOGLE_SHEETS_CREDENTIALS not configured, skipping Google Sheets");
        return null;
    }

    try {
        const credentials = JSON.parse(Buffer.from(env.GOOGLE_SHEETS_CREDENTIALS, "base64").toString());

        return new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
    } catch (error) {
        console.error("Failed to parse GOOGLE_SHEETS_CREDENTIALS:", error);
        return null;
    }
}

/** Обновляет Google таблицу */
export async function updateGoogleSheet(spreadsheetId: string): Promise<void> {
    const auth = getGoogleAuth();
    if (!auth) {
        console.log("Google Sheets not configured, skipping");
        return;
    }

    try {
        const sheets: sheets_v4.Sheets = google.sheets({ version: "v4", auth });

        // Получаем актуальные тарифы
        const tariffs: TariffRecord[] = await getLatestTariffs();

        if (tariffs.length === 0) {
            console.log(`No tariffs to update for sheet: ${spreadsheetId}`);
            return;
        }

        // Формируем заголовки
        const headers = [
            "Дата",
            "Склад",
            "Регион",
            "Доставка База",
            "Доставка Литр",
            "Коэф. Доставки",
            "МП База",
            "МП Литр",
            "Коэф. МП",
            "Хранение База",
            "Хранение Литр",
            "Коэф. Хранения",
        ];

        // Формируем строки данных
        const rows = tariffs.map((t) => [
            t.date,
            t.warehouse_name,
            t.geo_name || "",
            t.box_delivery_base?.toString() || "",
            t.box_delivery_liter?.toString() || "",
            t.box_delivery_coef_expr?.toString() || "",
            t.box_delivery_marketplace_base?.toString() || "",
            t.box_delivery_marketplace_liter?.toString() || "",
            t.box_delivery_marketplace_coef_expr?.toString() || "",
            t.box_storage_base?.toString() || "",
            t.box_storage_liter?.toString() || "",
            t.box_storage_coef_expr?.toString() || "",
        ]);

        const values = [headers, ...rows];

        // Обновляем таблицу
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${SHEET_NAME}!A1`,
            valueInputOption: "RAW",
            requestBody: { values },
        });

        console.log(`✅ Updated sheet: ${spreadsheetId} with ${rows.length} rows`);
    } catch (error: any) {
        if (error?.code === 404) {
            console.error(`❌ Sheet not found or no access: ${spreadsheetId}`);
        } else {
            console.error(`❌ Error updating sheet ${spreadsheetId}:`, error?.message);
        }
    }
}
