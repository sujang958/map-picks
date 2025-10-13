import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";

const app = new Elysia().use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! })).get("/", () => "Hello Elysia").ws("/ws", {
  message(ws, message) {

  },
})




app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
