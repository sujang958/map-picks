import type { Side } from "@self/types/ws";
import typia from "typia";

export interface MapPickProps {
  t1Id: string;
  t2Id: string;
  mapPool: string[]
  bestOf: 3
  turn?: number
}

export type Veto = { map: string }
export type Select = { map: string, enemyTeamPick: Side }
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

  validateTurn(teamId: string) {
    //TODO: this.t1Select.concat(this.t2Select)

    return (this.isT1Turn && teamId === this.t1Id) || (!this.isT1Turn && teamId === this.t2Id);
  }

  veto(teamId: string, map: string) {
    if (!this.availableMaps.includes(map)) return false
    if (!this.validateTurn(teamId)) return false
    // if (this.turn >= this.bestOf * 2 - 1) return false

    if (this.isT1Turn)
      this.t1Veto.push({ map });
    else
      this.t2Veto.push({ map });

    this.turn++;
  }

  select(teamId: string, map: string, enemyTeamPick: Side) {
    if (!this.availableMaps.includes(map)) return false
    if (!this.validateTurn(teamId)) return false

    if (this.isT1Turn)
      this.t1Select.push({ map, enemyTeamPick });
    else
      this.t2Select.push({ map, enemyTeamPick });

    this.turn++;
  }

  static fromJson(json: unknown): MatchMapPicks {
    if (!typia.is<JSONMatchMapPicks>(json)) throw new Error("Invalid JSON");

    const instance = new MatchMapPicks({
      ...json
    });
    instance.t1Veto.push(...json.t1Veto);
    instance.t1Select.push(...json.t1Select);
    instance.t2Veto.push(...json.t2Veto);
    instance.t2Select.push(...json.t2Select);

    return instance;
  }

  toJSON() {
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