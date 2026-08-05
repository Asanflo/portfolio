export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'message requis' });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: `Tu es l'assistant du portfolio de Florentin Agassem. Réponds UNIQUEMENT à partir des informations ci-dessous, en français, de façon brève et chaleureuse. Si l'info n'y est pas, invite la personne à utiliser la section Contact.\n\n${context}` }]
        },
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

  console.log("STATUS:", response.status);
  console.log("DATA GEMINI:", JSON.stringify(data, null, 2));

  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text 
  || JSON.stringify(data);

  res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}