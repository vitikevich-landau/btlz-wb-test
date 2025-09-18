import knex, { migrate } from "#postgres/knex.js";
import { startScheduler } from "#jobs/sync-tariffs.js";
import fs from "fs";
import path from "path";

async function runSeeds() {
    try {
        // Проверяем существование папки seeds
        const seedsPath = path.join(process.cwd(), "dist/postgres/seeds");
        if (fs.existsSync(seedsPath)) {
            const { seed } = await import("#postgres/knex.js");
            await seed.run();
            console.log("Seeds completed");
        } else {
            console.log("No seeds directory found, skipping seeds");
        }
    } catch (error: any) {
        console.log("Seeds skipped:", error?.message || error);
    }
}

async function main() {
    try {
        // Запускаем миграции
        await migrate.latest();

        // Запускаем сиды (если есть)
        await runSeeds();

        console.log("Database initialized successfully");

        // Запускаем планировщик
        startScheduler();
    } catch (error) {
        console.error("Failed to start application:", error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("\nShutting down gracefully...");
    await knex.destroy();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("\nShutting down gracefully...");
    await knex.destroy();
    process.exit(0);
});

// Запускаем приложение
await main();
