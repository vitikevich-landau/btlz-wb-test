/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema.createTable("tariffs", (table) => {
        table.increments("id").primary();
        table.date("date").notNullable();
        table.string("warehouse_name").notNullable();
        table.string("geo_name");

        // Тарифы доставки
        table.decimal("box_delivery_base", 10, 2);
        table.decimal("box_delivery_liter", 10, 2);
        table.decimal("box_delivery_coef_expr", 10, 2);

        // Тарифы маркетплейса
        table.decimal("box_delivery_marketplace_base", 10, 2);
        table.decimal("box_delivery_marketplace_liter", 10, 2);
        table.decimal("box_delivery_marketplace_coef_expr", 10, 2);

        // Тарифы хранения
        table.decimal("box_storage_base", 10, 4);
        table.decimal("box_storage_liter", 10, 4);
        table.decimal("box_storage_coef_expr", 10, 2);

        table.timestamps(true, true);

        // Уникальный индекс для обновления данных за день
        table.unique(["date", "warehouse_name"]);

        // Индекс для быстрого поиска по дате
        table.index("date");
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTable("tariffs");
}
