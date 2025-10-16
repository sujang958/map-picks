import { eq } from "drizzle-orm";
import { db } from "../db";
import { WSHandler } from "./types";
import { matches } from "../db/schema";
import { JSONMatchMapPicks } from "@self/core";

const Open: WSHandler = async ({ matchId, teamId }: { matchId: string, teamId?: string }) => {
  const match = await db.query.matches.findFirst({ where: eq(matches.id, matchId), with: { mapPool: true } })
  if (!match)
    return { type: "ERROR", message: "Match not found" }

  const jsonMapPicks: JSONMatchMapPicks = { ...match.mapPicks, mapPool: match.mapPool.maps, t1Id: match.t1Id, t2Id: match.t2Id }

  // TODO: i should do that every time i query or do something about match

  return { type: "MATCH.NEW_STATE", payload: { ...jsonMapPicks, canParticipate: (match.t1Id === teamId || match.t2Id === teamId) ? true : false } }
}

export default Open