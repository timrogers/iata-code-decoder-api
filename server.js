require('dotenv').config()
const app = require('./api');

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`✈️  Airports API running on port ${PORT}`));