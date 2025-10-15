import { JSONMatchMapPicks } from '@self/core';
import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const teams = sqliteTable('teams', {
  id: text('id')
    .primaryKey()
    .notNull()
    .default(sql`(lower(hex(randomblob(8))))`),

  name: text('name', { length: 32 }).notNull(),

  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const matches = sqliteTable('matches', {
  id: text('id')
    .primaryKey()
    .notNull()
    .default(sql`(lower(hex(randomblob(16))))`),

  mapPoolId: integer('map_pool_id').notNull(),
  mapPicks: text('map_picks', { mode: "json" }).$type<JSONMatchMapPicks>().notNull(),

  t1Id: text('t1_id')
    .notNull(),
  t2Id: text('t2_id')
    .notNull(),

  // bestOf: integer('best_of').notNull(), // 1, 3, 5

  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const mapPools = sqliteTable('mapPools', {
  id: integer('id').primaryKey(),
  maps: text('maps', { mode: 'json' })
    .notNull()
    .$type<string[]>()
    .default(sql`(json_array())`),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  matches: many(matches),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  mapPool: one(mapPools, { fields: [matches.mapPoolId], references: [mapPools.id] }),
  t1: one(teams, { fields: [matches.t1Id], references: [teams.id] }),
  t2: one(teams, { fields: [matches.t2Id], references: [teams.id] }),
}));

export const mapPoolsRelations = relations(mapPools, ({ many }) => ({
  matches: many(matches),
}));

export type InsertMatch = typeof matches.$inferInsert;
export type SelectMatch = typeof matches.$inferSelect;
