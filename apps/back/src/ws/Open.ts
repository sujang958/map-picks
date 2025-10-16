import { eq } from "drizzle-orm";
import { db } from "../db";
import { WSHandler } from "./types";
import { matches } from "../db/schema";
import { getMatch } from "../db/utils";

const Open: WSHandler = async ({ matchId, teamId }: { matchId: string, teamId?: string }) => {
  const match = await getMatch(matchId)
  if (!match)
    return { type: "ERROR", message: "Match not found" }

  return { type: "MATCH.NEW_STATE", payload: { ...match.mapPicks, canParticipate: (match.t1Id === teamId || match.t2Id === teamId) ? true : false } }
}

export default Open