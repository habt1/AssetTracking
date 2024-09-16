require('dotenv').config();
const cors = require('cors');
const app = require('./app');

// Enable CORS for all routes and origins
app.use(cors());

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
