const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "mathiasconnect.db"), (err) => {

    if (err) {
        console.error("Erro ao abrir o banco:", err.message);
    } else {
        console.log("Banco SQLite conectado!");
    }

});

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS sugestoes (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            nome TEXT,

            turma TEXT,

            categoria TEXT,

            descricao TEXT,

            status TEXT DEFAULT 'pendente',

            data_envio DATETIME DEFAULT CURRENT_TIMESTAMP

        )
    `);

    // Migração: adiciona a coluna "status" em bancos criados antes desta versão
    db.all("PRAGMA table_info(sugestoes)", [], (err, colunas) => {

        if (err) {
            console.error("Erro ao verificar colunas:", err.message);
            return;
        }

        const temStatus = colunas.some((coluna) => coluna.name === "status");

        if (!temStatus) {
            db.run("ALTER TABLE sugestoes ADD COLUMN status TEXT DEFAULT 'pendente'", (err) => {
                if (err) {
                    console.error("Erro ao adicionar coluna status:", err.message);
                } else {
                    console.log("Coluna 'status' adicionada ao banco existente.");
                }
            });
        }
    });

});

module.exports = db;
