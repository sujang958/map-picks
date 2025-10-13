import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { teams } from "./db/schema";

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

      ws.send(`Hello ${team.id}, you sent: ${message}`);
    },
  })

// TODO: just create a passwor dor at least simple pin and make a frontend page for that not a big deal right?


app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
