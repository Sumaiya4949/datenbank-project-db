const pgp = require("pg-promise")()
const fs = require("fs")
const chalk = require("chalk")
const { v4: uuid } = require("uuid")

async function initDB() {
  // Wait for some time to let the db init
  await new Promise((resolve) => setTimeout(resolve, 5000))

  let db = null

  const address = "localhost:9000"
  const password = "Pass1234"
  const username = "postgres"
  const dbname = "datenbank_db"

  try {
    // Connect to postgres db container
    db = pgp(`postgres://${username}:${password}@${address}`)

    await db.connect()

    console.log(chalk.green(`Success! Connected to postgres at ${address}`))
  } catch (err) {
    console.error("Failed to connect db!", err)
    return
  }

  try {
    const allSqlQueries = fs.readFileSync("tables.sql", { encoding: "utf-8" })
    await db.any(allSqlQueries)

    console.log(chalk.green("Success! All tables created"))
    process.exit()
  } catch (err) {
    console.error("Failed to execute SQL queries!", err)
  }
}

initDB()
