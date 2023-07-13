const express = require('express');
const { sequelize } = require('./models');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const commentsRouter = require('./routes/comments');
const likesRouter = require('./routes/likes');

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/', [
  likesRouter,
  postsRouter,
  usersRouter,
  loginRouter,
  commentsRouter,
]);

app.listen(port, async () => {
  console.log(port, '포트로 서버가 열렸습니다.');
  await sequelize.authenticate();
  console.log('db가 인증되었습니다.');
});
