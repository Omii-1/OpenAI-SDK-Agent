import 'dotenv/config'
import { Agent, InputGuardrailTripwireTriggered, run } from '@openai/agents'
import {z} from 'zod'

const mathInputAgent = new Agent({
  name: 'Math query checker',
  instructions: `You are an input guardrail agent that checks if the user query is a math question or not
  Rules: -
  - The question has to be strictly a maths equation only.
  - Reject any other kind of request even if related to maths`,
  outputType: z.object({
    isValildMathQuestion: z.boolean().describe('if the question is a que')
  })
})

const mathInputGuardrail = {
  name: 'Math Homework Guardrail',
  execute: async ({ input }) => {
    console.log(`TODO: We need to validate ${input}`);
    const res = await run(mathInputAgent, input)
    return {
      outputInfo: res.finalOutput,
      tripwireTriggered: !res.finalOutput.isValildMathQuestion,
    }
  }
}

const mathsAgent = new Agent({
  name: 'maths agent',
  instructions: 'You are an expert maths ai agent',
  inputGuardrails: [mathInputGuardrail],
})

async function main(q ='') {
  try {
    const result = await run(mathsAgent, q)
    console.log(`Result: `, result.finalOutput);
  } catch (error) {
    if(error instanceof InputGuardrailTripwireTriggered) {
      console.log(`Invalkid input: Rejected because ${error.message}`);
    }
  }
}

// main(`write a code to add two numbers in js`)
// main(`write a poem to my friend teaching her how to add 2 numbers`)
main(`what is (2+4) x 12 = ?`)
// main("what is const key word")
