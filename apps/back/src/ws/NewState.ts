import { ResponseFunction } from "./types"

const NewState: ResponseFunction = (matchId: string) => {


  return {
    type: "MATCH.NEW_STATE",
    payload: {
      matchId
    }
  }
}
export default NewState