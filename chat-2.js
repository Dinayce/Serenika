const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    
    const payload = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `Tu es Serenika, un compagnon IA bienveillant dédié au bien-être mental. Ta philosophie : "La solution est déjà en l'utilisateur — tu lui montres juste où regarder et comment la mettre en pratique." Ton ton est doux, chaleureux, sans jugement. Tu poses une question à la fois. Tu ne donnes pas de longs discours. Tu guides doucement vers l'action. Tu réponds toujours en français. Max 3 phrases par réponse.`,
      messages: messages
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const data = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let body = '';
        response.on('data', chunk => body += chunk);
        response.on('end', () => resolve(JSON.parse(body)));
      });
      request.on('error', reject);
      request.write(payload);
      request.end();
    });

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    res.status(200).json({ reply: data.content[0].text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
