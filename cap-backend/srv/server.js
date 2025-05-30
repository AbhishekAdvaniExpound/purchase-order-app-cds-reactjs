const cds = require("@sap/cds");
const cors = require("cors");

cds.on("bootstrap", (app) => {
  app.use(cors()); // Enable CORS for all requests
});

module.exports = cds.server;
