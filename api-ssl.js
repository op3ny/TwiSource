const https = require('https');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const ws = require('ws');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 9843;

// Configuração do SQLite
const db = new sqlite3.Database('./database.sqlite');

// Carregue os certificados
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/twisource.hsyst.xyz/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/twisource.hsyst.xyz/fullchain.pem')
};

// Criação das tabelas
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT UNIQUE,
            secret_key TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            content TEXT,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            user_id INTEGER,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(post_id) REFERENCES posts(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);
});

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public-ssl')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para parsear JSON
app.use(express.json());

// Middleware de autenticação JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token de autenticação não fornecido.' });

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
        req.user = user;
        next();
    });
};

// Endpoint de registro
app.post('/register', (req, res) => {
    const { nickname } = req.body;
    const secretKey = crypto.randomBytes(16).toString('hex');

    db.run('INSERT INTO users (nickname, secret_key) VALUES (?, ?)', [nickname, secretKey], function(err) {
        if (err) {
            return res.status(400).json({ error: 'Nickname já está em uso.' });
        }
        res.json({ secretKey });
    });
});

// Endpoint de login
app.post('/login', (req, res) => {
    const { nickname, secretKey } = req.body;

    db.get('SELECT * FROM users WHERE nickname = ? AND secret_key = ?', [nickname, secretKey], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token });
    });
});

// Endpoint para enviar posts
app.post('/posts', authenticateToken, upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.userId;
    const image = req.file ? req.file.filename : null;

    db.run('INSERT INTO posts (user_id, title, content, image) VALUES (?, ?, ?, ?)', [userId, title, content, image], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao criar post.' });
        }
        res.json({ postId: this.lastID });
    });
});

// Endpoint para listar posts
app.get('/posts', authenticateToken, (req, res) => {
    db.all('SELECT posts.*, users.nickname FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC', (err, posts) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar posts.' });
        }
        res.json(posts);
    });
});

// Endpoint para enviar comentários
app.post('/comments', authenticateToken, (req, res) => {
    const { postId, content } = req.body;
    const userId = req.user.userId;

    db.run('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [postId, userId, content], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao enviar comentário.' });
        }
        res.json({ commentId: this.lastID });
    });
});

// Endpoint para listar comentários de um post
app.get('/posts/:postId/comments', authenticateToken, (req, res) => {
    const { postId } = req.params;

    db.all('SELECT comments.*, users.nickname FROM comments JOIN users ON comments.user_id = users.id WHERE comments.post_id = ? ORDER BY comments.created_at ASC', [postId], (err, comments) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar comentários.' });
        }
        res.json(comments);
    });
});

// Configuração do WebSocket para comentários em tempo real
const wss = new ws.Server({ noServer: true });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const { postId, userId, content } = JSON.parse(message);

        db.run('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [postId, userId, content], function(err) {
            if (err) {
                return ws.send(JSON.stringify({ error: 'Erro ao enviar comentário.' }));
            }

            db.get('SELECT comments.*, users.nickname FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = ?', [this.lastID], (err, comment) => {
                if (err) {
                    return ws.send(JSON.stringify({ error: 'Erro ao buscar comentário.' }));
                }

                console.log(comment);

                wss.clients.forEach((client) => {
                    if (client.readyState === ws.OPEN) {
                        client.send(JSON.stringify({ type: 'comment', comment })); // Envia o tipo 'comment'
                    }
                });
            });
        });
    });
});

// Crie o servidor HTTPS
const server = https.createServer(options, app).listen(port, () => {
    console.log(`Servidor HTTPS rodando em https://0.0.0.0:${port}`);
});

// Configuração do upgrade do WebSocket
server.on('upgrade', (request, socket, head) => {
    // Verifique se a requisição é para o WebSocket
    if (request.headers['upgrade'] !== 'websocket') {
        socket.end('HTTP/1.1 400 Bad Request');
        return;
    }

    // Verifique se o socket já foi manipulado
    if (socket.wsHandled) {
        return;
    }
    socket.wsHandled = true; // Marque o socket como manipulado

    // Manipule o upgrade apenas uma vez
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
