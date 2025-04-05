const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

// Lê a chave do Firebase do ambiente
const firebaseConfig = JSON.parse(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig)
});

const db = admin.firestore();

const app = express();
const PORTA = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/verificar", async (req, res) => {
  console.log("Recebido:", req.body);

  const numero = req.body.input5;

  if (!numero) {
    return res.status(400).json({ sucesso: false, mensagem: "Campo 'input5' não enviado." });
  }

  const COLECAO = "cancelamento";

  try {
    const snapshot = await db.collection(COLECAO).get();

    if (snapshot.empty) {
      return res.json({ sucesso: false, mensagem: "Nenhum documento encontrado." });
    }

    let encontrado = false;

    snapshot.forEach((doc) => {
      const dados = doc.data();

      const contemNumero = Object.values(dados).some((valor) => {
        return typeof valor === "string" && valor.includes(numero);
      });

      if (contemNumero) {
        encontrado = true;
        return res.json({
          sucesso: true,
          mensagem: "Número encontrado.",
          documento: doc.id,
          dados
        });
      }
    });

    if (!encontrado) {
      return res.json({ sucesso: false, mensagem: "Número não encontrado." });
    }
  } catch (erro) {
    console.error("Erro:", erro);
    return res.status(500).json({ sucesso: false, erro: "Erro interno no servidor." });
  }
});

app.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando na porta ${PORTA}`);
});
