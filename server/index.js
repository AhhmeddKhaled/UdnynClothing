```js
const express = require("express");

const app = express();

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("UdnynClothing Server is working!");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Server is working",
    port: PORT,
    node: process.version
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`UdnynClothing Server running on port ${PORT}`);
});
```
