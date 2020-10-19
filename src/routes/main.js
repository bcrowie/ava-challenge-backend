const handleResponse = require("../utils/handleResponse");
const { handleMutation } = require("../routes/mutations");
const handlePing = require("./ping");
const infoModel = require("../models/infoModel");
const isValidReqMethod = require("../utils/isValidReqMethod");
const { getConversations, handleDelete } = require("../routes/conversations");

module.exports = handleRequest = (req, res) => {
  const { url, method } = req;

  if (!isValidReqMethod(method, url)) {
    handleResponse(400, { msg: `Invalid request` }, res);
  } else {
    if (method === "GET") {
      if (url === "/ping") {
        handlePing(res);
      } else if (url === "/info") {
        handleResponse(200, infoModel, res);
      } else if (url === "/conversations") {
        getConversations(res);
      }
    } else if (method === "DELETE" && url.includes("conversations")) {
      handleDelete(req, res);
    } else if (method === "POST" && url === "/mutations") {
      handleMutation(req, res);
    }
  }
};
