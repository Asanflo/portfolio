export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message requis' });
  }


  try {

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },

        body: JSON.stringify({

          model: "llama-3.1-8b-instant",

          messages: [
            {
              role: "system",
              content: `
Tu es l'assistant du portfolio de Florentin Agassem.

Réponds UNIQUEMENT à partir des informations ci-dessous,
en français, de façon brève et chaleureuse.

Si l'information n'y est pas, invite la personne à utiliser
la section Contact.

Informations du portfolio :

${context}
`
            },

            {
              role: "user",
              content: message
            }
          ],

          temperature: 0.5,
          max_tokens: 300

        })
      }
    );

    console.log("STATUS:", response.status);

    console.log("GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY);
    console.log("GROQ KEY LENGTH:", process.env.GROQ_API_KEY?.length);
    const data = await response.json();


    
    console.log("DATA GROQ:", JSON.stringify(data, null, 2));


    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Erreur Groq"
      });
    }


    const reply =
      data.choices?.[0]?.message?.content
      ||
      "Désolé, je n'ai pas pu générer de réponse.";


    return res.status(200).json({ reply });


  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Erreur serveur"
    });

  }
}