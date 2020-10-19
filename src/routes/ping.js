const pingModel = require("../models/pingModel");

module.exports = (res) => {
  res.write(JSON.stringify(pingModel));
  res.end();
};
