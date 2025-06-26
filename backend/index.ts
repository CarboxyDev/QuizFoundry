import express from 'express';
import cors from 'cors';
const app = express();
const port = 2003;

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.get('/test', (req, res) => {
  res.json({
    message: 'Hello from Express!',
    status: 'success',
  });
});

app.listen(port, () => console.log(`Backend listening on port ${port}`));
