import { WSResponse } from "@self/types/ws";

export type WSHandler = (data: any) => Promise<WSResponse>