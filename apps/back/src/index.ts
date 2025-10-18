import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";
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
