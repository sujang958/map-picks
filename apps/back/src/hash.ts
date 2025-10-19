const password = "441613"

Bun.password.hash(password, "argon2id").then(console.log)