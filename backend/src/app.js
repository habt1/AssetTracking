const express = require('express');
const app = express();
const port = 3001; // Use a different port from the Next.js frontend

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
