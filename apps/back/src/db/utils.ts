import { eq } from "drizzle-orm"
import { db } from "."
import { matches } from "./schema"
import { JSONMatchMapPicks } from "@self/core"

const unifyJsonMapPicks = async (matchId: string) => {
  const match = await db.query.matches.findFirst({ where: eq(matches.id, matchId), with: { mapPool: true, t1: true, t2: true } })
  if (!match) return false

  const mapPicks = { ...match.mapPicks, mapPool: match.mapPool.maps, t1Id: match.t1Id, t2Id: match.t2Id }

  await db.update(matches).set({ mapPicks }).where(eq(matches.id, matchId))

  return { ...match, mapPicks }
}

export const getMatch = async (matchId: string) => {
  return await unifyJsonMapPicks(matchId)
}

export const updateMatchMapPicks = async (matchId: string, mapPicks: JSONMatchMapPicks) => {
  const match = await getMatch(matchId)

  if (!match) return false

  const ma: JSONMatchMapPicks = { ...mapPicks, mapPool: match.mapPool.maps, t1Id: match.t1Id, t2Id: match.t2Id }

  return await db.update(matches).set({ mapPicks: ma }).where(eq(matches.id, matchId))
}