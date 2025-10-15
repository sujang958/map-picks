export type Side = "Attack" | "Defense"

export type WSResponse = {
  type: "MATCH.NEW_STATE"
  payload: any  // TODO: just copy from backend
} | { type: "ERROR", message: string }

export type WSRequest = {
  type: "MATCH.DECISION_MADE"
  payload: { matchId: string } & ({
    decision: string
    type: "VETO_MAP" | "SELECT_MAP"
  } | {
    decision: Side
    type: "PICK_SIDE"
  })
}