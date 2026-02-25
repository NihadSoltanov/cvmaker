const dot = require('dotenv');
dot.config({ path: '.env.local' });

console.log('Testing openrouter. API KEY:', process.env.OPENROUTER_API_KEY ? 'Set' : 'Not Set');

const test = async () => {
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                    {
                        role: "system",
                        content: `Test system`,
                    },
                    {
                        role: "user",
                        content: `Test`,
                    }
                ],
            }),
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (err) {
        console.error(err);
    }
}
test();
