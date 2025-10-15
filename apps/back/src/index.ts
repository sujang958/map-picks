import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { matches, teams } from "./db/schema";
import type { WSRequest, WSResponse } from "@self/types/ws";
import typia from "typia";
import ErrorResponse from "./ws/Error";
import DecisionMade from "./ws/DecisionMade";

const app = new Elysia()
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  .get("/", ({ cookie }) => {
    console.log(cookie)

    return "Hello Elysia"
  })
  .get('/login/:id', async ({ jwt, params: { id }, cookie: { auth } }) => {
    const result = await db.query.teams.findFirst({ where: eq(teams.id, id) })

    if (!result) return 'No such team'

    const value = await jwt.sign({ id })

    auth.set({
      value,
      httpOnly: true,
      maxAge: 0.5 * 86400,

    })

    return `Signed in as ${result.name}` // redirect to frontend page
  })
  .ws("/ws/:matchId", {
    async message(ws, message) {
      const matchId = ws.data.params.matchId
      const team = await ws.data.jwt.verify(ws.data.cookie.auth.value as string)

      if (!team) return

      const request = typia.assert<WSRequest>(JSON.parse(String(message)))
      if (request.type == "MATCH.DECISION_MADE")
        return ws.send(JSON.stringify(DecisionMade({ teamId: team.id as string, decision: request.payload, matchId })))
    },
  })

// TODO: just create a passwor dor at least simple pin and make a frontend page for that not a big deal right?


app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
