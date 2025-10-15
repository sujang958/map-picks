import { eq } from "drizzle-orm";
import { db } from "../db";
import { WSHandler } from "./types";
import { matches } from "../db/schema";

const Open: WSHandler = async ({ matchId, teamId }: { matchId: string, teamId: string }) => {
  const match = await db.query.matches.findFirst({ where: eq(matches.id, matchId), with: { mapPool: true, t1: true, t2: true } })
  if (!match)
    return { type: "ERROR", message: "Match not found" }
  if (match.t1.id !== teamId && match.t2.id !== teamId)
    return { type: "MATCH.NEW_STATE", payload: { ...match.mapPicks, canParticipate: false } }

  return { type: "MATCH.NEW_STATE", payload: { ...match.mapPicks, canParticipate: true } }
}

export default Open