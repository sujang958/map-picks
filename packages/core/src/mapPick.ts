import typia from "typia";

export type Side = "Attack" | "Defense"

export interface MapPickProps {
  t1Id: string;
  t2Id: string;
  mapPool: string[]
  bestOf: 3
  turn?: number
}

export type Veto = { map: string }
export type Select = { map: string, enemyTeamPick: Side | "WAITING..." }
export interface JSONMatchMapPicks {
  version: "1.0";
  t1Id: string;
  t2Id: string;
  mapPool: string[];
  bestOf: 3;
  t1Veto: Veto[];
  t1Select: Select[];
  t2Veto: Veto[];
  t2Select: Select[];
  turn: number;
}

/**
 * Currently, only supports bo3
 */
export class MatchMapPicks {
  public readonly t1Id: string;
  public readonly t2Id: string;
  public readonly mapPool: string[]
  public readonly bestOf: 3

  public readonly t1Veto: Veto[] = [];
  public readonly t1Select: Select[] = [];
  public readonly t2Veto: Veto[] = [];
  public readonly t2Select: Select[] = [];

  private turn: number = 0;

  constructor({ t1Id, t2Id, mapPool, bestOf, turn = 0 }: MapPickProps) {
    this.t1Id = t1Id;
    this.t2Id = t2Id;
    this.mapPool = mapPool;
    this.bestOf = bestOf;
    this.turn = turn
  }

  get availableMaps() {
    return this.mapPool.filter(m => {
      return !this.t1Veto.find(v => v.map === m)
        && !this.t2Veto.find(v => v.map === m)
        && !this.t1Select.find(s => s.map === m)
        && !this.t2Select.find(s => s.map === m);
    });
  }

  get isT1Turn() {
    return this.turn % 2 === 0;
  }

  get lastSelectedMap() {
    if (this.t1Select.length <= 0) return null;
    if (this.t1Select.length === this.t2Select.length) return { teamId: this.t2Id, map: this.t2Select.at(-1)! };
    return { teamId: this.t1Id, map: this.t1Select.at(-1)! };
  }

  // t1 veto - t2 veto - t1 select - t2 pick side - t2 select - t2 pick side - t1 veto - t2 veto - t1 pick side
  //    0    -    1    -     2     -      3       -      4    -        5     -    6     -    7    -     8
  get timeTo(): { who: "T1" | "T2", to: "VETO_MAP" | "SELECT_MAP" | "PICK_SIDE" } | null {
    if (this.turn == 0)
      return { who: "T1", to: "VETO_MAP" }
    else if (this.turn == 1)
      return { who: "T2", to: "VETO_MAP" }
    else if (this.turn == 2)
      return { who: "T1", to: "SELECT_MAP" }
    else if (this.turn == 3)
      return { who: "T2", to: "PICK_SIDE" }
    else if (this.turn == 4)
      return { who: "T1", to: "SELECT_MAP" }
    else if (this.turn == 5)
      return { who: "T2", to: "PICK_SIDE" }
    else if (this.turn == 6)
      return { who: "T1", to: "VETO_MAP" }
    else if (this.turn == 7)
      return { who: "T2", to: "VETO_MAP" }
    else if (this.turn == 7)
      return { who: "T1", to: "PICK_SIDE" }
    else
      return null
  }

  validateTurn(teamId: string) {
    //TODO: this.t1Select.concat(this.t2Select)

    return (this.isT1Turn && teamId === this.t1Id) || (!this.isT1Turn && teamId === this.t2Id);
  }

  veto({ teamId, map }: Veto & { teamId: string }) {
    if (!this.availableMaps.includes(map)) return false
    if (!this.validateTurn(teamId)) return false
    // if (this.turn >= this.bestOf * 2 - 1) return false

    if (this.isT1Turn)
      this.t1Veto.push({ map });
    else
      this.t2Veto.push({ map });

    this.turn++;

    return true
  }

  select({ teamId, map, enemyTeamPick }: Select & { teamId: string }) {
    if (!this.availableMaps.includes(map)) return false
    if (!this.validateTurn(teamId)) return false

    if (this.isT1Turn)
      this.t1Select.push({ map, enemyTeamPick });
    else
      this.t2Select.push({ map, enemyTeamPick });

    this.turn++; // TODO: maybe remove this to solve picking side?

    return true
  }

  pickSide({ teamId, side }: { teamId: string, side: Side }) {
    if (!this.validateTurn(teamId)) return false
    if (!this.lastSelectedMap) return false

    const { teamId: who, map: lastSelectedMap } = this.lastSelectedMap;
    if (lastSelectedMap.enemyTeamPick !== "WAITING..." || (who == teamId)) return false

    lastSelectedMap.enemyTeamPick = side;

    this.turn++;

    return true
  }

  static fromJson(json: unknown): MatchMapPicks {
    const data = typeof json === 'string' ? JSON.parse(json) : json;

    if (!typia.is<JSONMatchMapPicks>(data)) throw new Error("Invalid JSON");

    const instance = new MatchMapPicks({
      ...data
    });
    instance.t1Veto.push(...data.t1Veto);
    instance.t1Select.push(...data.t1Select);
    instance.t2Veto.push(...data.t2Veto);
    instance.t2Select.push(...data.t2Select);

    return instance;
  }

  toJSON(): JSONMatchMapPicks {
    return {
      version: "1.0",
      t1Id: this.t1Id,
      t2Id: this.t2Id,
      mapPool: this.mapPool,
      bestOf: this.bestOf,
      t1Veto: this.t1Veto,
      t1Select: this.t1Select,
      t2Veto: this.t2Veto,
      t2Select: this.t2Select,
      turn: this.turn,
    };
  }
}

// What about just fucking unify typia usage in one package?