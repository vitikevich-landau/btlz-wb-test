import env from "#config/env/env.js";
import type { WBApiResponse, WBTariff } from "#types/wb-api.types.js";

/** Получает тарифы с WB API */
export async function fetchWBTariffs(date: string): Promise<WBTariff[]> {
    if (!env.WB_API_TOKEN) {
        console.log(env);
        throw new Error("WB_API_TOKEN not configured");
    }

    const url = `https://common-api.wildberries.ru/api/v1/tariffs/box?date=${date}`;

    const response = await fetch(url, {
        headers: {
            "Authorization": env.WB_API_TOKEN,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WB API error ${response.status}: ${errorText}`);
    }

    const data: WBApiResponse = await response.json();
    return data.response?.data?.warehouseList || [];
}

/** Преобразует строку с запятой в число */
export function parseDecimal(value: string | undefined): number | null {
    if (!value) return null;
    // Заменяем запятую на точку и парсим
    const parsed = parseFloat(value.replace(",", "."));
    return isNaN(parsed) ? null : parsed;
}
