const express = require("express");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const encryptionRoutes = require("./routes/encryption");

app.use("/api/encryption", encryptionRoutes);
app.use("/api/imageEncruption", require("./routes/imageEncruption"));

app.listen(port, () => {
  console.log(`Backend is working on port number: ${port}`);
});
