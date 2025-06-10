const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'duckshot'
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL conectado!");
});


app.post('/login', (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === '') {
        return res.status(400).send("Nome inválido");
    }
    db.query('INSERT IGNORE INTO players (name, score) VALUES (?, 0)', [name], (err) => {
        if (err) return res.status(500).send("Erro no login");
        res.sendStatus(200);
    });
});


app.post('/score', (req, res) => {
    const { name, score } = req.body;
    if (!name || typeof score !== "number") {
        return res.status(400).send("Dados inválidos");
    }

    db.query(
        'UPDATE players SET score = GREATEST(score, ?) WHERE name = ?',
        [score, name],
        (err) => {
            if (err) return res.status(500).send("Erro ao salvar score");
            res.sendStatus(200);
        }
    );
});


app.get('/ranking', (req, res) => {
    db.query('SELECT name, score FROM players ORDER BY score DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}/login.html`);
});
