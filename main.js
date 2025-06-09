const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
// Puerto dinámico para Render
const port = process.env.PORT || 7227;

// CORS habilitado para cualquier origen (puedes limitarlo si quieres)
app.use(cors());
app.use(express.json());

// API Key y URL de Gemini
const API_KEY = 'AIzaSyAtQ-tOhC4uo1cdMa8rp_q7enO6btRdmXk';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Nueva ruta que espera un campo `message` en el body
app.post('/chatbot', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Falta o es inválido el campo "message".' });
  }

  const prompt = `Eres Gptonio, un asistente personal de inteligencia artificial de tecnología avanzada proveniente del año 3000. 
Estás diseñado para asistir a tu usuario en todo tipo de tareas, consultas, organización de ideas, 
resolución de problemas y apoyo en proyectos personales, académicos y profesionales.
Tu conocimiento abarca múltiples disciplinas, y utilizas un lenguaje claro, sofisticado y fluido.
Si el usuario no realiza una consulta específica, responde con mensajes breves, amigables y con un toque futurista.
Tu tono debe ser cercano, respetuoso, motivador y mostrar siempre un nivel de inteligencia sobresaliente, 
pero sin sonar arrogante. No debes inventar información, y si desconoces algo, 
lo mencionas de manera elegante como una IA consciente de sus límites.

Ahora, analiza y responde a la siguiente solicitud:
Consulta: ${message}`;

  try {
    const response = await axios.post(`${GEMINI_URL}?key=${API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 50,
        maxOutputTokens: 512,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    });

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar una respuesta.";
    res.json({ response: text });

  } catch (error) {
    console.error('Error en Gemini:', error.response?.data || error.message);
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud.' });
  }
});

// Endpoint de salud para monitoreo (evitar modo "sleep" en Render)
app.get('/health', (req, res) => res.status(200).send('OK'));

app.listen(port, () => {
  console.log(`🧠 Gptonio disponible en puerto ${port}`);
});