const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);


// Set up MongoDB connection
//exam :mongodb+srv://khangnd:...@cluster0.jb8tgpt.mongodb.net/asm?authMechanism=SCRAM-SHA-1&authSource=khangnd
const mongoURI = '';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

const io = require('socket.io')(server);

// Set up Socket.io
const users = {};
socketHandler(io, users);

// Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(passport.initialize());

// Routes
const usersRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
app.use('/users', usersRoutes);
app.use('/auth', authRoutes);

// 404 Not Found middleware
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
 

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message });
});

// Start server
const port = 3000;
server.listen(port, '192.168.1.181', () => console.log(`Server is listening on port ${port}`));
