import jwt from "@elysiajs/jwt";
import { Elysia, status, t } from "elysia";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { matches, teams } from "./db/schema";
import type { WSRequest, WSResponse } from "@self/types/ws";
import typia from "typia";
import ErrorResponse from "./ws/Error";
import DecisionMade from "./ws/DecisionMade";
import Open from "./ws/Open";
import SuperJSON from "superjson";
import { getMatch } from "./db/utils";
import cors from "@elysiajs/cors";

const app = new Elysia()
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  .get("/", ({ cookie }) => {
    console.log(cookie)

    return "Hello Elysia"
  })
  .use(cors({
    // origin
    //   : "localhost"
    // TODO: fix this, no *
  }))
  .post('/login', async ({ jwt, body: { teamName, password }, cookie: { auth } }) => {
    console.log(teamName, password)

    const result = await db.query.teams.findFirst({ where: eq(teams.name, teamName) })
    if (!result) return status(404, { error: true, message: 'No such team' })
    if (!result?.password) return status(404, { error: true, message: "Password not found" })

    if (!await Bun.password.verify(password, result.password)) return status(401, { error: true, message: 'No such team' })
    const value = await jwt.sign({ id: result.id })

    auth.set({
      value,
      httpOnly: true,
      maxAge: 0.5 * 86400,
    })

    return status(200, { message: `Signed in as ${result.name}` }) // redirect to frontend page
  }, {
    body: t.Object({
      // teamId: t.String(),
      teamName: t.String(),
      password: t.String()
    })
  })
  .ws("/ws/:matchId", {
    async open(ws) {
      // console.log(new MatchMapPicks({
      //   bestOf: 3, mapPool: [
      //     "Lotus",
      //     "Ascent",
      //     "Pearl",
      //     "Bind",
      //     "Haven",
      //     "Sunset",
      //     "Abyss"
      //   ], t1Id: "9fc0204fdbe4cd04", t2Id: "654fa6869711c496",
      // }).toJSON())

      const matchId = ws.data.params.matchId
      const team = await ws.data.jwt.verify(ws.data.cookie.auth.value as string)

      console.log(team, matchId)

      if (team && team.id) {
        const match = await getMatch(matchId)

        if (!match) return

        if (match.t1Id == team.id)
          ws.send(SuperJSON.stringify({
            type: "MATCH.PARTICIPATE", payload: {
              canParticipate: true, amIT1: true
            }
          } satisfies WSResponse))
        else if (match.t2Id == team.id)
          ws.send(SuperJSON.stringify({
            type: "MATCH.PARTICIPATE", payload: {
              canParticipate: true, amIT1: false
            }
          } satisfies WSResponse))
      }

      ws.subscribe(`MATCH:${matchId}`)

      ws.send(SuperJSON.stringify(await Open({ matchId, teamId: team ? team.id : undefined })))
    },
    async close(ws) {
      ws.unsubscribe(`MATCH:${ws.data.params.matchId}`)
    },
    async message(ws, message) {
      const matchId = ws.data.params.matchId
      const team = await ws.data.jwt.verify(ws.data.cookie.auth.value as string)

      if (!team) return

      console.log(new Date(), message, team, matchId)

      const parsed = SuperJSON.parse(JSON.stringify(message))

      try {
        if (!typia.is<WSRequest>(parsed)) return

        if (parsed.type == "MATCH.DECISION_MADE") {
          const res = SuperJSON.stringify(await DecisionMade({ teamId: team.id as string, decision: parsed.payload, matchId }))

          ws.send(res)
          return ws.publish(`MATCH:${matchId}`, res)
        }
      } catch (e) {
        console.log(e)
      }
    },
  })

// TODO: just create a passwor dor at least simple pin and make a frontend page for that not a big deal right?


app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
