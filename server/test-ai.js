import 'dotenv/config';
import ai from './configs/ai.js';

async function test() {
    try {
        console.log("Using model:", process.env.OPENAI_MODEL);
        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [{ role: 'system', content: 'You are a bot.' }, { role: 'user', content: 'Say hello' }]
        });
        console.log('Success:', response.choices[0].message.content);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
test();
