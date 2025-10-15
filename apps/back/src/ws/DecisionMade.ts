import { Decision, WSResponse } from "@self/types/ws"
import { WSHandler } from "./types"
import { db } from "../db"
import { eq } from "drizzle-orm"
import { matches } from "../db/schema"
import { MatchMapPicks } from "@self/core"

const DecisionMade = async ({ matchId, teamId, decision }: { teamId: string, decision: Decision, matchId: string }): Promise<WSResponse> => {
  const match = await db.query.matches.findFirst({ where: eq(matches.id, matchId), with: { mapPool: true, t1: true, t2: true } })

  if (!match)
    return { type: "ERROR", message: "Match not found" }
  if (match.t1.id !== teamId && match.t2.id !== teamId)
    return { type: "ERROR", message: "Not your match" }

  const matchMapPicks = MatchMapPicks.fromJson(match.mapPicks)

  if (matchMapPicks.isT1Turn && (match.t1.id !== teamId)) return { type: "ERROR", message: "Not your turn" }

  let success: boolean = false
  if (decision.type == "VETO_MAP")
    success = matchMapPicks.veto({ teamId, map: decision.decision })
  else if (decision.type == "PICK_SIDE")
    success = matchMapPicks.pickSide({ teamId, side: decision.decision })
  else if (decision.type == "SELECT_MAP")
    success = matchMapPicks.select({ teamId, map: decision.decision, enemyTeamPick: "WAITING..." })

  if (!success)
    return { type: "ERROR", message: "Invalid decision" }

  const changed = matchMapPicks.toJSON()
  await db.update(matches).set({ mapPicks: changed }).where(eq(matches.id, matchId))

  return { type: "MATCH.NEW_STATE", payload: { ...changed, canParticipate: true } }
}

export default DecisionMade