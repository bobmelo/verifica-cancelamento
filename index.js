const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const serviceAccount = require("./projeto_cancelamento_vadzap.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
const PORTA = 3000;

app.use(bodyParser.json());

app.post("/verificar", async (req, res) => {
  console.log("Recebido do Pabbly:", req.body);

  const numero = req.body.input5;

  if (!numero) {
    return res.status(400).json({ sucesso: false, mensagem: "Campo 'input5' não foi enviado." });
  }

  const COLECAO = "cancelamento";

  try {
    const snapshot = await db.collection(COLECAO).get();

    if (snapshot.empty) {
      return res.json({ sucesso: false, mensagem: "Nenhum documento encontrado na coleção." });
    }

    let encontrado = false;

    snapshot.forEach((doc) => {
      const dados = doc.data();

      const contemNumero = Object.values(dados).some((valor) => {
        if (typeof valor === "string" && valor.includes(numero)) {
          return true;
        }
        return false;
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
  console.log(`🚀 Servidor rodando em http://localhost:${PORTA}/verificar`);
});
