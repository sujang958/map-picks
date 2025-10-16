import { JSONMatchMapPicks } from '@self/core';
import { relations, sql } from 'drizzle-orm';
import { uuid } from 'drizzle-orm/pg-core';
import { json } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { serial } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { varchar } from 'drizzle-orm/pg-core';
import { text } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
// import { integer, pgTable, text } from 'drizzle-orm/sqlite-core';

const createdAtHelper = {
  createdAt: timestamp().defaultNow().notNull(),
}

export const teams = pgTable('teams', {
  id: uuid()
    .primaryKey()
    .defaultRandom()
    .notNull(),


  name: varchar('name', { length: 32 }).unique().notNull(),

  ...createdAtHelper,
});

export const matches = pgTable('matches', {
  id: uuid()
    .defaultRandom()
    .primaryKey()
    .notNull()
  ,

  mapPoolId: integer('map_pool_id').notNull(),
  mapPicks: json().$type<JSONMatchMapPicks>().notNull(),

  t1Id: uuid('t1_id')
    .notNull(),
  t2Id: uuid('t2_id')
    .notNull(),

  // bestOf: integer('best_of').notNull(), // 1, 3, 5

  ...createdAtHelper,
});

export const mapPools = pgTable('mapPools', {
  id: serial('id').primaryKey(),
  maps: json().$type<string[]>().default([]).notNull(),
  ...createdAtHelper,
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
