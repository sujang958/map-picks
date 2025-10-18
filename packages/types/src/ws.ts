import type { JSONMatchMapPicks, Side } from "@self/core"

// export type PickByType<T, K> = T extends { type: K } ? T : never;

export type WSResponse = {
  type: "MATCH.PARTICIPATE", payload: {
    amIT1: boolean,
    canParticipate: boolean,
  }
} | {
  type: "MATCH.NEW_STATE"
  payload: {
    id: string;
    createdAt: Date;
    mapPoolId: number;
    t1Id: string;
    t2Id: string;
    mapPicks: JSONMatchMapPicks;
    mapPool: {
      id: number;
      createdAt: Date;
      maps: string[];
    };
    t1: {
      name: string;
      id: string;
      createdAt: Date;
    };
    t2: {
      name: string;
      id: string;
      createdAt: Date;
    }


    // canParticipate: boolean, amIT1: boolean
  }  // TODO: just copy from backend
} | { type: "ERROR", message: string }

// JSONMatchMapPicks & { canParticipate: boolean, amIT1: boolean }  // TODO: just copy from backend

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