import {Agent, run, tool} from '@openai/agents'
import 'dotenv/config'
import {z} from 'zod'
import fs from 'node:fs/promises'

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

async function runAgent(query=''){
  const result = await run(salesAgent, query)
  console.log(result.finalOutput);
}

runAgent('I had a plan 399, i need a refund right now, my id is 23233 because of i am shifting to a new place and place refund immediately')