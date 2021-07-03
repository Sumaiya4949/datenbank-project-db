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

const MASTER_PASSWORD = "Pass1234"
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
        // 3 test
      },
      {
        id: uuid(),
        name: "Physics",
        // 1 test
      },
      {
        id: uuid(),
        name: "Chemistry",
        // no test
      },
    ],
    level2: [
      {
        id: uuid(),
        name: "Math",
        // 3 test
      },
      {
        id: uuid(),
        name: "Biology",
        // 1 test
      },
      {
        id: uuid(),
        name: "History",
        // no test
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

  // Create 8 tests
  const tests = [
    {
      id: uuid(),
      name: "Quiz",
      date: "2021-06-30",
      subjectId: subjects.level1[0].id,
    },
    {
      id: uuid(),
      name: "Final",
      date: "2021-06-30",
      subjectId: subjects.level1[0].id,
    },
    {
      id: uuid(),
      name: "Quiz",
      date: "2021-06-30",
      subjectId: subjects.level1[0].id,
    },
    {
      id: uuid(),
      name: "Final",
      date: "2021-06-30",
      subjectId: subjects.level1[1].id,
    },
    {
      id: uuid(),
      name: "Mock",
      date: "2021-06-30",
      subjectId: subjects.level2[0].id,
    },
    {
      id: uuid(),
      name: "Quiz",
      date: "2021-06-30",
      subjectId: subjects.level2[0].id,
    },
    {
      id: uuid(),
      name: "Final",
      date: "2021-06-30",
      subjectId: subjects.level2[0].id,
    },
    {
      id: uuid(),
      name: "Final",
      date: "2021-06-30",
      subjectId: subjects.level2[1].id,
    },
  ]

  // Insert all tests
  for (const test of tests) {
    await db.any(
      `INSERT INTO TEST VALUES ('${test.id}', '${test.name}', '${test.date}');`
    )
    await db.any(
      `INSERT INTO HAS_TEST VALUES ('${test.subjectId}', '${test.id}');`
    )
  }

  const pupils = [
    {
      id: uuid(),
      username: "harry",
      forename: "Harry",
      surname: "Potter",
      cname: "level1",

      appearsIn: [tests[0].id, tests[1].id, tests[2].id, tests[3].id],
    },
    {
      id: uuid(),
      username: "ronald",
      forename: "Ron",
      surname: "Weasley",
      cname: "level1",

      appearsIn: [tests[2].id, tests[3].id],
    },
    {
      id: uuid(),
      username: "hermionie",
      forename: "Hermionie",
      surname: "Granger",
      cname: "level1",

      appearsIn: [tests[4].id, tests[5].id],
    },
    {
      id: uuid(),
      username: "fred",
      forename: "Fred",
      surname: "Weasley",
      cname: "level1",

      appearsIn: [tests[6].id, tests[7].id],
    },
    {
      id: uuid(),
      username: "george",
      forename: "George",
      surname: "Weasley",

      appearsIn: [tests[0].id, tests[1].id],
    },
    {
      id: uuid(),
      username: "sirius",
      forename: "Sirius",
      surname: "Black",
      cname: "level2",

      appearsIn: [tests[2].id, tests[3].id],
    },
    {
      id: uuid(),
      username: "riddle",
      forename: "Tom",
      surname: "Riddle",
      cname: "level2",

      appearsIn: [tests[4].id, tests[5].id],
    },
    {
      id: uuid(),
      username: "hagrid",
      forename: "Rubius",
      surname: "Hagrid",
      cname: "level2",

      appearsIn: [tests[6].id, tests[7].id],
    },
    {
      id: uuid(),
      username: "luna",
      forename: "Luna",
      surname: "Lovegood",
      cname: "level2",

      appearsIn: [tests[0].id, tests[1].id],
    },
  ]

  // Insert all pupils
  for (const pupil of pupils) {
    await db.any(
      `INSERT INTO PUPIL VALUES ('${pupil.id}', '${pupil.username}', '${MASTER_PASSWORD_HASH}', '${pupil.forename}', '${pupil.surname}');`
    )
    if (pupil.cname) {
      await db.any(
        `INSERT INTO ASSIGNS VALUES ('${pupil.cname}', '${pupil.id}');`
      )
    }

    for (const testId of pupil.appearsIn) {
      await db.any(
        `INSERT INTO APPEARS_IN VALUES ('${pupil.id}', '${testId}', '${
          Math.floor(Math.random() * 100) + 1
        }');`
      )
    }
  }

  const teachers = [
    {
      id: uuid(),
      username: "snape",
      forename: "Severus",
      surname: "Snape",
      subjects: [
        subjects.level1[0],
        subjects.level1[1],
        subjects.level2[0],
        subjects.level2[1],
      ],
    },
    {
      id: uuid(),
      username: "lupin",
      forename: "Ramus",
      surname: "Lupin",
      subjects: [subjects.level1[2], subjects.level2[2]],
    },
    {
      id: uuid(),
      username: "dolores",
      forename: "Dolores",
      surname: "Umbridge",
    },
  ]

  for (const teacher of teachers) {
    await db.any(
      `INSERT INTO TEACHER VALUES ('${teacher.id}', '${teacher.username}', '${MASTER_PASSWORD_HASH}', '${teacher.forename}', '${teacher.surname}');`
    )

    if (teacher.subjects) {
      for (const mySubject of teacher.subjects) {
        await db.any(
          `INSERT INTO TEACHES VALUES ('${teacher.id}', '${mySubject.id}');`
        )
      }
    }
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
