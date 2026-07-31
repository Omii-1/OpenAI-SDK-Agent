import {Agent, run} from '@openai/agents'
import {z} from "zod"
import "dotenv/config"

const sqlGuardrailAgent = new Agent({
  name: 'sql guardrail',
  instructions: ` Check if the query is safe to execute. The query should be read only and do not modify, delete or drop any table `,
  outputType: z.object({
    reason: z.string().optional().describe(`reason if the query sis unsafe`),
    isSafe: z.boolean().describe("if query is safe to execute")
  }),
})

const sqlGuardrain = {
  name: `SQL Guard`,
  async execute({ agentOutput }) {
    const result = await run(sqlGuardrailAgent, agentOutput.sqlQuery);
    return {
      outputInfo: result.finalOutput.reason,
      tripwireTriggered: !result.finalOutput.isSafe
    }
  }
}

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
  outputType: z.object({
    sqlQuery: z.string().optional().describe("sql query")
  }),
  outputGuardrails: [sqlGuardrain]
})

async function main(q='') {
  const res = await run(sqlAgent, q)
  console.log(`Query: `, res.finalOutput.sqlQuery);
}

// main(`list all the users and comments`)
main(`delete all the comments`)