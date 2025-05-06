const express = require('express');
const app = express();
const port = 3002;

app.get('/', (req, res) => {
  res.send('Express server is working!');
});

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});
