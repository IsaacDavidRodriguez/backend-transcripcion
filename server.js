const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

const HF_TOKEN = process.env.HF_TOKEN;

app.post('/transcribir', upload.single('audio'), async (req, res) => {
  try {
    const audioBuffer = fs.readFileSync(req.file.path);

    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': req.file.mimetype
        },
        body: audioBuffer
      }
    );

    fs.unlinkSync(req.file.path);

    const data = await response.json();

    console.log(`🕒 ${new Date().toLocaleString()} | IP: ${req.ip} | Texto: ${data.text}`);

    res.json({ texto: data.text || 'No se pudo transcribir' });

  } catch (error) {
    console.error('Error en transcripción:', error.message);
    res.status(500).json({ error: 'Error al transcribir' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend activo en puerto ${PORT}`));

