import { StreamingTextResponse, LangChainStream } from 'ai'
import { ChatOpenAI } from '@langchain/openai'
import { AIMessage, BaseMessageFields, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Langfuse } from 'langfuse-node';
import { ConversationTokenBufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

export const runtime = 'edge'


const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const chatRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(200, "1 d"),
});

export async function POST(req: Request) {
  try {
    console.log('Starting POST request');
    const { messages, model, temperature, prompt, topP, presencePenalty, frequencyPenalty, maxTokens, traceId, userId, username } = await req.json()
    console.log('Request body parsed:', { model, temperature, prompt, topP, presencePenalty, frequencyPenalty, maxTokens, traceId, userId, username });

    if (!userId || !username) {
      return new Response("User ID and username are required for rate limiting", { status: 400 });
    }

    const { success, limit, reset, remaining } = await chatRatelimit.limit(`chat-limit-${userId}-${username}`);
    if (!success) {
      return new Response(JSON.stringify({
        message: "You have reached your chat request limit for the day.",
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }

    const langfuse = process.env.LANGFUSE_SECRET_KEY
      ? new Langfuse({
        publicKey: process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY!,
        secretKey: process.env.LANGFUSE_SECRET_KEY,
        baseUrl: process.env.LANGFUSE_BASE_URL
      })
      : null;

    const trace = langfuse?.trace({ id: traceId });

    const llm = new ChatOpenAI({
      modelName: model || 'gpt-3.5-turbo',
      streaming: true,
      temperature: temperature ?? 0,
      topP: topP ?? 1,
      presencePenalty: presencePenalty ?? 0.9,
      frequencyPenalty: frequencyPenalty ?? 0.9,
      maxTokens: maxTokens ?? 150,
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    console.log('LLM initialized');
    
    const memory = new ConversationTokenBufferMemory({
      llm: llm,
      maxTokenLimit: 2000, // Increase token limit to store more context
      returnMessages: true,
      memoryKey: "chat_history",
    });
    console.log('Memory initialized');

    const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    // const systemPrompt = `AI assistant. Time: ${currentTime}. Remember user info. Be concise.`
    const systemPrompt =  prompt || `You are an AI assistant. Current time: ${currentTime}. You are operating with a temperature of ${temperature}, topP of ${topP}, presence penalty of ${presencePenalty}, frequency penalty of ${frequencyPenalty}, and max tokens of ${maxTokens}.`


    const chatPrompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
    ]);

    const chain = new ConversationChain({
      llm: llm,
      memory: memory,
      prompt: chatPrompt,
    });

    console.log('Chain initialized');

    const { stream, handlers } = LangChainStream()

    // Instead, use this to properly format and save the message history
    const formattedMessages = messages.map((message: { role: string; content: string | BaseMessageFields; }) => 
      message.role === 'user' 
        ? new HumanMessage(message.content)
        : new AIMessage(message.content)
    );

    await memory.chatHistory.addMessages(formattedMessages);

    // Get the last user message
    const lastMessage = messages[messages.length - 1].content;

    if (langfuse && trace) {
      trace.generation({
        name: 'chat_request',
        startTime: new Date(),
        endTime: new Date(),
        model: llm.modelName,
        modelParameters: {
          temperature: llm.temperature,
          topP: llm.topP,
          presencePenalty: llm.presencePenalty,
          frequencyPenalty: llm.frequencyPenalty,
          maxTokens: llm.maxTokens,
        },
        prompt: messages[messages.length - 1].content,
      });
    }

    console.log('Calling chain');
    chain.call(
      { input: lastMessage },
      [handlers]
    );

    console.log('Chain call completed');
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Detailed error in chat route:', error);
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: 'An error occurred while processing your request', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'An unknown error occurred' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}