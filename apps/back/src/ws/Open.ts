import { eq } from "drizzle-orm";
import { db } from "../db";
import { WSHandler } from "./types";
import { matches } from "../db/schema";
import { getMatch } from "../db/utils";

const Open: WSHandler = async ({ matchId, teamId }: { matchId: string, teamId?: string }) => {
  const match = await getMatch(matchId) // TODO: add try catch

  if (!match)
    return { type: "ERROR", message: "Match not found" }

  return { type: "MATCH.NEW_STATE", payload: { ...match, canParticipate: (match.t1Id === teamId || match.t2Id === teamId) ? true : false, amIT1: match.t1Id == teamId ? true : false } } // this kinda sucks, like it literally is right tho, but if i need check if im t2, i should canParticipate && !amIT1
}

export default Open