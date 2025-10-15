import { ResponseFunction } from "./types"

const ErrorResponse: ResponseFunction = (message: string) => ({
  type: "ERROR",
  message,
})

export default ErrorResponse