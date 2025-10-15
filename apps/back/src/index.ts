import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { matches, teams } from "./db/schema";
import type { WSRequest, WSResponse } from "@self/types/ws";
import typia from "typia";
import ErrorResponse from "./ws/Error";

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
  .ws("/ws", {
    async message(ws, message,) {
      const team = await ws.data.jwt.verify(ws.data.cookie.auth.value as string)

      console.log(ws.data.cookie, team)

      if (!team) return


      // Validation
      const request = typia.assert<WSRequest>(JSON.parse(String(message)))

      if (request.type !== "MATCH.DECISION_MADE") return

      const matchId = request.payload.matchId
      const match = await db.query.matches.findFirst({ where: eq(matches.id, matchId), with: { mapPool: true, t1: true, t2: true } })

      if (!match)
        return ws.send(JSON.stringify(ErrorResponse("Match not found")))
      if (match.t1.id !== team.id && match.t2.id !== team.id)
        return ws.send(JSON.stringify(ErrorResponse("Not your match")))

      const isT1 = match.t1.id === team.id
    },
  })

// TODO: just create a passwor dor at least simple pin and make a frontend page for that not a big deal right?


app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
