import { fetchWBTariffs } from "#services/wb-api.js";
import { saveTariffs } from "#services/tariffs-db.js";
import { updateGoogleSheet, getSheetIds } from "#services/google-sheets.js";

/** Синхронизирует тарифы */
export async function syncTariffs(): Promise<void> {
    try {
        const today = new Date().toISOString().split("T")[0];
        console.log(`\n🔄 [${new Date().toISOString()}] Starting sync for ${today}`);

        // 1. Получаем тарифы из WB
        console.log("📥 Fetching tariffs from WB API...");
        const tariffs = await fetchWBTariffs(today);
        console.log(`✅ Fetched ${tariffs.length} tariffs`);

        // 2. Сохраняем в БД
        console.log("💾 Saving to database...");
        await saveTariffs(today, tariffs);

        // 3. Обновляем Google Sheets из .env
        const sheetIds = getSheetIds();
        if (sheetIds.length > 0) {
            console.log(`📊 Updating ${sheetIds.length} Google Sheets...`);
            for (const sheetId of sheetIds) {
                await updateGoogleSheet(sheetId);
            }
        } else {
            console.log("⚠️  No Google Sheets configured in GOOGLE_SHEET_IDS");
        }

        console.log(`✅ [${new Date().toISOString()}] Sync completed successfully\n`);
    } catch (error: any) {
        console.error(`❌ [${new Date().toISOString()}] Sync failed:`, error?.message || error);
    }
}

/*
 * Запускает синхронизацию каждый час
 * Можно использовать какую-нить библиотку, например node-cron
 *  или вообще запускать скрипт через cron операционной системы
 * */
export function startScheduler(): void {
    console.log("⏰ Starting scheduler...");

    // Запускаем сразу при старте
    syncTariffs().catch(console.error);

    // Затем каждый час
    const interval = setInterval(
        () => {
            syncTariffs().catch(console.error);
        },
        60 * 60 * 1000,
    );

    // Graceful shutdown
    const shutdown = () => {
        console.log("\n👋 Shutting down scheduler...");
        clearInterval(interval);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    console.log("✅ Scheduler started - syncing every hour\n");
}
