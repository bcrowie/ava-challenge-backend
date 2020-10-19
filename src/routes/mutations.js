const Conversation = require("../conversation");
const handleResponse = require("../utils/handleResponse");
const isValidData = require("../utils/isValidData");

let conversations = [];

const conversationExists = (data) => {
  for (let item of conversations) {
    if (item.id === data.conversationId || item.id === data.id) {
      return item;
    }
  }
  return false;
};

const handleMutation = (req, res) => {
  let body = "";

  req
    .on("data", (data) => {
      body += data;
    })
    .on("end", () => {
      const validData = isValidData(body);

      if (validData) {
        let convo = conversationExists(validData);

        if (!convo) {
          convo = new Conversation(validData);
          conversations.push(convo);
        }

        const { msg, ok, status, text } = convo.mutate(validData);
        handleResponse(status, { msg, ok, text }, res);
      } else {
        handleResponse(400, { msg: "Invalid data" }, res);
      }
    });
};

module.exports = { conversations, conversationExists, handleMutation };
