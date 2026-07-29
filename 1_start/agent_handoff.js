import {Agent, tool, run} from '@openai/agents'
import 'dotenv/config'
import {z} from 'zod'
import fs from 'node:fs/promises'
import {RECOMMENDED_PROMPT_PREFIX} from'@openai/agents-core/extensions'

// refund agent

const processRefund = tool({
  name: 'process_refund',
  description: 'this tool processes the refund for a customer',
  parameters: z.object({
    customerId: z.string().describe('id of the customer'),
    reason: z.string().describe('reason for refund')
  }),
  execute: async function(){
    fs.appendFile('./refunds.txt', `Refund for customer having ID ${customerId} for ${reason}`, 'utf-8')
    return {refundIssued: true}
  },
})

const refundAgent = new Agent({
  name: 'Refund Agent',
  instructions: 'You are expert in issuing refunds to the customer',
  tools: [processRefund]
})

// sales agent

const fetchAvailablePlans = tool({
  name: 'fetch_available_plans',
  description: 'fetches the available plans for internet',
  parameters: z.object({}),
  execute: async function() {
    return [
      { plan_id: 1, price_inr: 399, speed: '30MB/s'},
      { plan_id: 2, price_inr: 399, speed: '100MB/s'},
      { plan_id: 3, price_inr: 399, speed: '200MB/s'},
    ]
  }
})

const salesAgent = new Agent({
  name: 'Sales Agent',
  instructions: `
  You are an expert sales agent for am internet broadband connection 
  talk to the user and help with what they want
  `,
  tools: [fetchAvailablePlans, refundAgent.asTool({
    toolName: 'refund_expert',
    toolDescription: 'handle refund questions and requests'
  })]
})

const receptionAgent = new Agent({
  name: "reception agent",
  instructions: `${RECOMMENDED_PROMPT_PREFIX} You are the customer facing agent expert in understandinig what customer needs and then root them or hadoff them to the right agent`,
  handoffDescription: `You have two agents available: 
  - salesAgent: Expert iin handling queries like all plans and pricing available.
  - refundAgent: Expert in handling user queries for existing customers and issue refunds and help them.
  `,
  handoffs: [salesAgent, refundAgent]
})

async function main(query = '') {
  const res = await run(receptionAgent, query)
  console.log(`Result: ${res.finalOutput}`);
  console.log(`History: ${JSON.stringify(res.history, null, 2)}`);
}

// main(`Hey there, can you tell me what plan is best for me? show me all the available plans`)
main(`Hey there, i facing issue with my plans i want my plan refund my customer id is CUSD1234`)