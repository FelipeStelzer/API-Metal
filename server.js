const express = require('express');

const axios = require("axios");

const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logSchema);

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

// Desabilita a verificação de certificado SSL
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Endpoint para buscar o IP do usuário
app.get('/api/get-ip', async (req, res) => {
  try {
      const response = await axios.get('https://ipinfo.io/json');
      const userIp = response.data.ip; // O IP do usuário
      res.json({ ip: userIp });
  } catch (error) {
      console.error('Erro ao buscar o IP:', error);
      res.status(500).json({ error: 'Erro ao buscar o IP' });
  }
});

// Endpoint para registrar IP, data e hora
app.post('/api/login', async (req, res) => {
  try {
      const response = await axios.get('https://ipinfo.io/json');
      const userIp = response.data.ip;


      // Exemplo de uso do banco de dados
    const collection = db.collection('logs'); // Substitua pelo nome da coleção que você deseja usar
    const result = await collection.insertOne({ ip: userIp }); // Exemplo de inserção
    console.log('Registro inserido:', result);

      res.status(201).json({ message: 'IP registrado com sucesso', ip: userIp });
  } catch (error) {
      console.error('Erro ao registrar IP:', error);
      res.status(500).json({ error: 'Erro ao registrar IP' });
  }
});

// Rota para salvar uma mensagem no MongoDB
app.post('/api/mensagem', async (req, res) => {
  try {
    const { usuario, mensagem } = req.body;
    const collection = db.collection('mensagens');
    const result = await collection.insertOne({ usuario, mensagem, data: new Date() });
    res.status(200).send({ success: true, message: 'Mensagem salva com sucesso', id: result.insertedId });
    console.log("mensagem salva com sucesso");
  } catch (error) {
    res.status(500).send({ success: false, message: 'Erro ao salvar mensagem', error });
    console.log("erro au salvar a mensagem");
  }
});

// Rota para obter as mensagens do MongoDB
app.get('/api/mensagens', async (req, res) => {
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
