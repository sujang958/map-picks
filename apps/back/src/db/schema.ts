import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const matchesTable = sqliteTable('matches', {
  id: integer('id').primaryKey(),

  t1Name: text('t1_name', { length: 32 }).notNull(), // first team to choose
  t2Name: text('t2_name', { length: 32 }).notNull(),

  mapPicks: text('map_picks', { mode: "json" }).$type<{ t1Select: string[], t1Veto: string[], t2Select: string[], t2Veto: string[] }>().notNull(),

  // bestOf: integer('best_of').notNull(), // 1, 3, 5

  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const mapPoolsTable = sqliteTable('mapPools', {
  id: integer('id').primaryKey(),
  maps: text('maps', { mode: "json" }).$type<string[]>().notNull(),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const matchesRelations = relations(matchesTable, ({ one }) => ({
  mapPool: one(mapPoolsTable),
}));

export type InsertMatch = typeof matchesTable.$inferInsert;
export type SelectMatch = typeof matchesTable.$inferSelect;
