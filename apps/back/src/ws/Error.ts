import { WSHandler } from "./types"

const ErrorResponse: WSHandler = async (message: string) => ({
  type: "ERROR",
  message,
})

export default ErrorResponse