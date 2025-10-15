import type { Side } from "@self/types/ws";

export interface MapPickProps {
  t1Id: string;
  t2Id: string;
  mapPool: string[]
  bestOf: 1 | 3 | 5;
}

export type Veto = { map: string }
export type Select = { map: string, enemyTeamPick: Side }

export class MatchMapPicks {
  public readonly t1Id: string;
  public readonly t2Id: string;
  public readonly mapPool: string[]
  public readonly bestOf: 1 | 3 | 5;

  public readonly t1Veto: Veto[] = [];
  public readonly t1Select: Select[] = [];
  public readonly t2Veto: Veto[] = [];
  public readonly t2Select: Select[] = [];

  private turn: number = 0 // odd = t1, even = t2


  constructor({ t1Id, t2Id, mapPool, bestOf }: MapPickProps) {
    this.t1Id = t1Id;
    this.t2Id = t2Id;
    this.mapPool = mapPool;
    this.bestOf = bestOf;
  }

  get availableMaps() {
    return this.mapPool.filter(m => {
      return !this.t1Veto.find(v => v.map === m)
        && !this.t2Veto.find(v => v.map === m)
        && !this.t1Select.find(s => s.map === m)
        && !this.t2Select.find(s => s.map === m);
    });
  }

  validateTurn(teamId: string) {
    const isT1Turn = this.turn % 2 === 0;

    return (isT1Turn && teamId === this.t1Id) || (!isT1Turn && teamId === this.t2Id);
  }

  veto(teamId: string, map: string) {
    if (!this.mapPool.includes(map)) {
      throw new Error("Map not in pool");
    }
    if (this.t1Veto.find(v => v.map === map) || this.t2Veto.find(v => v.map === map)) {
      throw new Error("Map already vetoed");
    }
    if (this.t1Select.find(s => s.map === map) || this.t2Select.find(s => s.map === map)) {
      throw new Error("Map already selected");
    }
    if (this.turn >= this.bestOf * 2 - 1) {
      throw new Error("All picks and vetoes are done");
    }
    const isT1 = this.turn % 2 === 0;
    if ((isT1 && teamId !== this.t1Id) || (!isT1 && teamId !== this.t2Id)) {
      throw new Error("Not your turn");
    }

    if (isT1) {
      this.t1Veto.push({ map });
    } else {
      this.t2Veto.push({ map });
    }
    this.turn++;
  }

  select(teamId: string, map: string, enemyTeamPick: Side) {
    if (!this.mapPool.includes(map)) {
      throw new Error("Map not in pool");
    }
    if (this.t1Veto.find(v => v.map === map) || this.t2Veto.find(v => v.map === map)) {
      throw new Error("Map already vetoed");
    }
    if (this.t1Select.find(s => s.map === map) || this.t2Select.find(s => s.map === map)) {
      throw new Error("Map already selected");
    }
    if (this.turn >= this.bestOf * 2 - 1) {
      throw new Error("All picks and vetoes are done");
    }
    const isT1 = this.turn % 2 === 0;
    if ((isT1 && teamId !== this.t1Id) || (!isT1 && teamId !== this.t2Id)) {
      throw new Error("Not your turn");
    }

    if (isT1) {
      this.t1Select.push({ map, enemyTeamPick });
    } else {
      this.t2Select.push({ map, enemyTeamPick });
    }
    this.turn++;
  }

  static fromJson() {
    // return new MatchMapPicks();
  }

  toJSON() {

  }
}
