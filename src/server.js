require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db.config');
const mainRouter = require('./api/routes/index');
const errorHandler = require('./utils/errorHandler');
const setupSocketIO = require('./config/socket.config');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(morgan('dev'));

const server = http.createServer(app);

const io = setupSocketIO(server);

app.set('io', io);

app.use('/', mainRouter);

app.use(errorHandler);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
