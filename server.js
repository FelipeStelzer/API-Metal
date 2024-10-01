const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

// Função para conectar ao MongoDB
async function connectToMongo() {
  process.env.MONGO_URI= "mongodb+srv://felipe:roblox234@cluster0.knm4j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
    return client.db('chatbotdb'); // Nome do banco de dados
  } catch (err) {
    console.error('Erro ao conectar no MongoDB:', err);
    process.exit(1); // Encerra o processo em caso de erro
  }
}

let db; // Variável para armazenar a conexão com o banco

// Rota para salvar uma mensagem no MongoDB
app.post('/mensagem', async (req, res) => {
  try {
    const { usuario, mensagem } = req.body;
    const collection = db.collection('mensagens');
    const result = await collection.insertOne({ usuario, mensagem, data: new Date() });
    res.status(200).send({ success: true, message: 'Mensagem salva com sucesso', id: result.insertedId });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Erro ao salvar mensagem', error });
  }
});

// Rota para obter as mensagens do MongoDB
app.get('/mensagens', async (req, res) => {
  try {
    const collection = db.collection('mensagens');
    const mensagens = await collection.find().toArray();
    res.status(200).send(mensagens);
  } catch (error) {
    res.status(500).send({ success: false, message: 'Erro ao obter mensagens', error });
  }
});

// Inicializa o servidor e conecta ao MongoDB
app.listen(port, async () => {
  db = await connectToMongo();
  console.log(`Servidor rodando na porta ${port}`);
});
