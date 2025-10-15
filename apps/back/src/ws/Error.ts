import { WSHandler } from "./types"

const ErrorResponse: WSHandler = (message: string) => ({
  type: "ERROR",
  message,
})

export default ErrorResponse