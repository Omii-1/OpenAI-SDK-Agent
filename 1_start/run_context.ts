import { Agent, run, tool, RunContext } from "@openai/agents";
import "dotenv/config";
import { z } from "zod";

interface MyContext {
  userId: string;
  userName: string;
  fetchUserInfo: () => Promise<string>;
}

const getUserInfoTool = tool({
  name: "get_user_info",
  description: "Gets the user info",
  parameters: z.object({}),
  execute: async (_, ctx?: RunContext<MyContext>): Promise<string | undefined> => {
    const res = await ctx?.context.fetchUserInfo()
    return res
  },
});

const customerSupportAgent = new Agent({
  name: "Customer support agent",
  instructions: () => {
    return `Youre an expert customer support agent`;
  },
  tools: [getUserInfoTool],
});

async function main(q: string, ctx: MyContext) {
  const res = await run(customerSupportAgent, q, {
    context: ctx,
  });
  console.log("Result: ", res.finalOutput);
}

main("Hey, what is my name", {
  userId: "1",
  userName: "Om Juvatkar",
  fetchUserInfo: async () => `userId=2, userName:'Soham kambli'`
});
