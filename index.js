const pgp = require("pg-promise")()
const fs = require("fs")
const chalk = require("chalk")
const { v4: uuid } = require("uuid")
const { SHA3 } = require("sha3")

function getPasswordHash(password) {
  const hash = new SHA3(512)
  hash.update(password)
  return hash.digest("hex")
}

const MASTER_PASSWORD = "123456"
const MASTER_PASSWORD_HASH = getPasswordHash(MASTER_PASSWORD)

async function populateDB(db) {
  // Insert 1 admin
  await db.any(
    `INSERT INTO ADMIN VALUES('${uuid()}', 'albus', '${MASTER_PASSWORD_HASH}', 'Albus', 'Dumbledore');`
  )

  // Insert 2 classes
  const classes = ["level1", "level2"]

  classes.forEach(async (className) => {
    await db.any(`INSERT INTO CLASS VALUES ('${className}');`)
  })

  // Define 6 subjects (3 per class)
  const subjects = {
    level1: [
      {
        id: uuid(),
        name: "Math",
      },
      {
        id: uuid(),
        name: "Physics",
      },
      {
        id: uuid(),
        name: "Chemistry",
      },
    ],
    level2: [
      {
        id: uuid(),
        name: "Math",
      },
      {
        id: uuid(),
        name: "Biology",
      },
      {
        id: uuid(),
        name: "History",
      },
    ],
  }

  // Insert all subjects for class "level1"
  for (const subject of subjects.level1) {
    await db.any(
      `INSERT INTO SUBJECT VALUES ('${subject.id}', '${subject.name}');`
    )
    await db.any(`INSERT INTO OFFERS VALUES ('level1', '${subject.id}');`)
  }

  // Insert all subjects for class "level2"
  for (const subject of subjects.level2) {
    await db.any(
      `INSERT INTO SUBJECT VALUES ('${subject.id}', '${subject.name}');`
    )
    await db.any(`INSERT INTO OFFERS VALUES ('level2', '${subject.id}');`)
  }
}

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
  } catch (err) {
    console.error("Failed to execute SQL queries!", err)
    return
  }

  try {
    await populateDB(db)
    console.log(chalk.green("Success! Data inserted to db"))
  } catch (err) {
    console.error("Failed to populate database!", err)
    return
  }

  process.exit()
}

initDB()
