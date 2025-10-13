import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const teamsTable = sqliteTable('teams', {
  id: text('id')
    .primaryKey()
    .notNull()
    .default(sql`(lower(hex(randomblob(8))))`),

  name: text('name', { length: 32 }).notNull().unique(),

  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const matchesTable = sqliteTable('matches', {
  id: text('id')
    .primaryKey()
    .notNull()
    .default(sql`(lower(hex(randomblob(16))))`),

  mapPoolId: integer('map_pool_id').notNull(),
  mapPicks: text('map_picks', { mode: "json" }).$type<{ t1Select: string[], t1Veto: string[], t2Select: string[], t2Veto: string[] }>().notNull(),

  t1Id: text('t1_id')
    .notNull(),
  t2Id: text('t2_id')
    .notNull(),

  // bestOf: integer('best_of').notNull(), // 1, 3, 5

  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const mapPoolsTable = sqliteTable('mapPools', {
  id: integer('id').primaryKey(),
  maps: text('maps', { mode: 'json' })
    .notNull()
    .$type<string[]>()
    .default(sql`(json_array())`),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const teamsRelations = relations(teamsTable, ({ many }) => ({
  matches: many(matchesTable),
}));

export const matchesRelations = relations(matchesTable, ({ one }) => ({
  mapPool: one(mapPoolsTable, { fields: [matchesTable.mapPoolId], references: [mapPoolsTable.id] }),
  t1: one(teamsTable, { fields: [matchesTable.t1Id], references: [teamsTable.id] }),
  t2: one(teamsTable, { fields: [matchesTable.t2Id], references: [teamsTable.id] }),
}));

export const mapPoolsRelations = relations(mapPoolsTable, ({ many }) => ({
  matches: many(matchesTable),
}));

export type InsertMatch = typeof matchesTable.$inferInsert;
export type SelectMatch = typeof matchesTable.$inferSelect;
