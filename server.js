const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const db = require("./banco");

const app = express();

// ⚠️ TROQUE ESSA SENHA antes de usar em produção
const ADMIN_SENHA = "mathias2026";

// Tokens de admin válidos no momento (fica em memória; reinicia ao reiniciar o servidor)
const tokensValidos = new Set();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Middleware que protege rotas de admin
function verificarAdmin(req, res, next) {

    const auth = req.headers.authorization;
    const token = auth && auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token || !tokensValidos.has(token)) {
        return res.status(401).json({ mensagem: "Acesso não autorizado" });
    }

    next();
}

// HOME
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// 🔥 SALVAR SUGESTÃO
app.post("/sugestoes", (req, res) => {

    const { nome, turma, categoria, descricao } = req.body;

    if (!turma || !descricao) {
        return res.status(400).json({ mensagem: "Preencha os campos obrigatórios" });
    }

    db.run(
        `INSERT INTO sugestoes (nome, turma, categoria, descricao, status)
         VALUES (?, ?, ?, ?, 'pendente')`,
        [nome, turma, categoria, descricao],
        function (err) {

            if (err) {
                console.log(err);
                return res.status(500).json({ mensagem: "Erro ao salvar sugestão" });
            }

            res.json({
                mensagem: "Sugestão enviada com sucesso!",
                id: this.lastID
            });
        }
    );
});

// 🔥 LISTAR SUGESTÕES
app.get("/sugestoes", (req, res) => {

    db.all(
        "SELECT * FROM sugestoes ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            res.json(rows);
        }
    );
});

// 🔒 LOGIN DO ADMIN (ESCOLA)
app.post("/admin/login", (req, res) => {

    const { senha } = req.body;

    if (senha !== ADMIN_SENHA) {
        return res.status(401).json({ mensagem: "Senha incorreta" });
    }

    const token = crypto.randomBytes(24).toString("hex");
    tokensValidos.add(token);

    res.json({ token });
});

// 🔒 LOGOUT DO ADMIN
app.post("/admin/logout", verificarAdmin, (req, res) => {
    const token = req.headers.authorization.slice(7);
    tokensValidos.delete(token);
    res.json({ mensagem: "Sessão encerrada" });
});

// 🔒 ATUALIZAR STATUS DE UMA SUGESTÃO (só admin)
app.put("/sugestoes/:id/status", verificarAdmin, (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ["pendente", "aprovado", "concluido", "rejeitado"];

    if (!statusValidos.includes(status)) {
        return res.status(400).json({ mensagem: "Status inválido" });
    }

    db.run(
        "UPDATE sugestoes SET status = ? WHERE id = ?",
        [status, id],
        function (err) {

            if (err) {
                console.log(err);
                return res.status(500).json({ mensagem: "Erro ao atualizar status" });
            }

            res.json({ mensagem: "Status atualizado com sucesso" });
        }
    );
});

// 🔒 EXCLUIR UMA SUGESTÃO (só admin)
app.delete("/sugestoes/:id", verificarAdmin, (req, res) => {

    const { id } = req.params;

    db.run("DELETE FROM sugestoes WHERE id = ?", [id], function (err) {

        if (err) {
            console.log(err);
            return res.status(500).json({ mensagem: "Erro ao excluir sugestão" });
        }

        res.json({ mensagem: "Sugestão excluída" });
    });
});

// 🔥 LIMPAR TUDO (opcional debug, só admin)
app.delete("/reset", verificarAdmin, (req, res) => {
    db.run("DELETE FROM sugestoes", [], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ mensagem: "Banco limpo" });
    });
});

app.listen(3000, () => {
    console.log("==================================");
    console.log(" Mathias Connect iniciado!");
    console.log(" http://localhost:3000");
    console.log(" Admin: http://localhost:3000/admin.html");
    console.log("==================================");
});
