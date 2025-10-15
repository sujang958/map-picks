import type { JSONMatchMapPicks } from "@self/core"

export type Side = "Attack" | "Defense"

// export type PickByType<T, K> = T extends { type: K } ? T : never;

export type WSResponse = {
  type: "MATCH.NEW_STATE"
  payload: JSONMatchMapPicks & { canParticipate: boolean }  // TODO: just copy from backend
} | { type: "ERROR", message: string }

// type a = Pick<WSResponse, { type: "ERROR" }> // TODO: how to do this shit bruh

export type Decision = ({
  decision: string
  type: "VETO_MAP" | "SELECT_MAP"
} | {
  decision: Side
  type: "PICK_SIDE"
})

export type WSRequest = {
  type: "MATCH.DECISION_MADE"
  payload: Decision
}

// { matchId: string } &