const express = require('express')
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

require('./routes/data.router')(app)
require('./routes/automation.router')(app)

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
})