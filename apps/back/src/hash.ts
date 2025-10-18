const password = "514632"

Bun.password.hash(password, "argon2id").then(console.log)