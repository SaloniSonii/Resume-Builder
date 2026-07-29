import 'dotenv/config';

async function testKey() {
    const key = process.env.OPENAI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Body:", text.substring(0, 200));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
testKey();
