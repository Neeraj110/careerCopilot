import { z } from 'zod';
import { ChatMistralAI } from '@langchain/mistralai';
const model = new ChatMistralAI({ model: 'mistral-large-latest', apiKey: 'fake' });
const schema = z.object({ name: z.string() });
const structured = model.withStructuredOutput(schema);
structured.invoke('hello');
