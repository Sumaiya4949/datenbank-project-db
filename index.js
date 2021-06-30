const pgp = require("pg-promise")
const fs = require("fs")
const { exit } = require("process")

// Wait for some time to let the db init
await new Promise((resolve) => setTimeout(resolve, 5000))

// Connect to postgres db container
const db = pgp("postgres://0.0.0.0:9000")

async function initDB() {
  try {
    await db.connect()
  } catch (err) {
    console.error("Failed to connect db!", err)
    return
  }

  try {
    const allSqlQueries = fs.readFileSync("init-db.sql", { encoding: "utf-8" })
    await db.any(allSqlQueries)
  } catch (err) {
    console.error("Failed to execute SQL queries!", err)
  }
}

initDB()
