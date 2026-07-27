import {Agent, run, tool} from '@openai/agents'
import 'dotenv/config'
import {z} from 'zod'
import axios from 'axios'

const getWeatherResultSchema = z.object({
  city: z.string().describe('name of the city'),
  degree_c: z.number().describe('the degree celcius of the temp'),
  condition: z.string().optional().describe('condition of the weather')
})

const getWeatherTool = tool({
  name: "get_weather",
  description: 'returns the current weather information for the given city',
  parameters: z.object({
    city: z.string().describe("name of the city")
  }),
  execute: async function({city}) {
    // TODO: Replace this with api call
    // return `The weather of ${city} is 12 with some wind`
    console.log("🔨 calling api");
    
    // Calling API 
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`
    const res = await axios.get(url, { responseType: "text"})
    return `the weather of ${city} is ${res.data}`
  }
})

const agent = new Agent({
  name: "Weather Agent",
  instructions: "You are an expert weather agent that helps user to tel weather report",
  tools: [getWeatherTool],
  outputType: getWeatherResultSchema
})

async function main(query='') {
  const result = await run(agent, query)
  console.log(`Results: `, result.finalOutput);
  
}

main("what is the current wearther in pune, delhi and chennai?")