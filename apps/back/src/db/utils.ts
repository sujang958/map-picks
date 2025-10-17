import { eq } from "drizzle-orm"
import { db } from "."
import { matches, teams } from "./schema"
import { JSONMatchMapPicks } from "@self/core"


const fixMatchMapPicks = (mapPicks: any, match: typeof matches.$inferSelect & { mapPool: { maps: string[] } }): JSONMatchMapPicks => {
  return { ...mapPicks, mapPool: match.mapPool.maps, t1Id: match.t1Id, t2Id: match.t2Id }
}

const unifyJsonMapPicks = async (matchId: string) => {
  const match = await db.query.matches.findFirst({ where: eq(matches.id, matchId), with: { mapPool: true, t1: true, t2: true } })
  if (!match) return null

  if (match.mapPicks.t1Id == match.t1Id && match.mapPicks.t2Id == match.t2Id && JSON.stringify(match.mapPicks.mapPool) === JSON.stringify(match.mapPool.maps))
    return match

  const mapPicks = fixMatchMapPicks(match.mapPicks, match)

  const returned = await db.update(matches).set({ mapPicks }).where(eq(matches.id, matchId)).returning()

  return { ...match, ...returned } // originally mapPicks
}

export const getMatch = async (matchId: string) => {
  return await unifyJsonMapPicks(matchId)
}

export const updateMatchMapPicks = async (matchId: string, mapPicks: JSONMatchMapPicks) => {
  const match = await getMatch(matchId)

  if (!match) return null // dont change it to false

  const fixedMapPicks: JSONMatchMapPicks = fixMatchMapPicks(mapPicks, match)

  return await db.update(matches).set({ mapPicks: fixedMapPicks }).where(eq(matches.id, matchId)).returning()
}