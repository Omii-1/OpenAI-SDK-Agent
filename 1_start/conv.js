import {Agent, run, tool} from '@openai/agents'
import {z} from "zod"
import "dotenv/config"

let sharedHistory = []

const executeSql = tool({
  name: 'execute sql',
  description: 'this executes the sql query',
  parameters: z.object({
    sql: z.string().describe(`the sql query`)
  }),
  execute: async function ({ sql }) {
    console.log(`[SQL]: Execute ${sql}`);
    return 'done'
  }
})

const sqlAgent = new Agent({
  name: 'SQL Expert Agent',
  instructions: `
  You are an expert SQL agent specialized in generating SQL queries for the user's request.

  Postgres Schema:
  Table: users
  - id SERIAL PRIMARY KEY
  - name VARCHAR(100) NOT NULL
  - email VARCHAR(255) UNIQUE NOT NULL
  - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

  Table: comments
  - id SERIAL PRIMARY KEY
  - user_id INT REFERENCES users(id)
  - comment_text TEXT NOT NULL
  - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

  Use this schema when generating queries.
  `,
  // outputType: z.object({
  //   sqlQuery: z.string().optional().describe("sql query")
  // }),
  // outputGuardrails: [sqlGuardrain],
  tools: [executeSql]
})

async function main(q='') {
  // stored the message in db
  sharedHistory.push({role: "user", content: q})
  const res = await run(sqlAgent, sharedHistory)
  sharedHistory = res.history

  // console.log(res.history);
  console.log('Final Out: ', res.finalOutput);
}

main('Hi my name is om juvatkar').then(() => {
  main('Get me all the users with my name')
})