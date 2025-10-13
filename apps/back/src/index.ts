import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";

const app = new Elysia()
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  .get("/", () => "Hello Elysia")
  .get('/login/:pin', async ({ jwt, params: { name }, cookie: { auth } }) => {
    const value = await jwt.sign({ name })

    auth.set({
      value,
      httpOnly: true,
      maxAge: 7 * 86400,
    })

    return `Sign in as ${value}`
  })
  .ws("/ws", {
    message(ws, message,) {
      // const team = ws.data.jwt.verify(ws.data.cookie.auth.value!)
    },
  })




app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
