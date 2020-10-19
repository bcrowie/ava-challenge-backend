const url = require("url");
const Conversation = require("../conversation");
let { conversations, conversationExists } = require("./mutations");
const handleResponse = require("../utils/handleResponse");
const isValidData = require("../utils/isValidData");

const wsCreate = (data, ws) => {
  const validData = isValidData(JSON.stringify(data.creation));
  let convo = conversationExists(data.creation);

  if (!convo) {
    convo = new Conversation(validData);
    conversations.push(convo);
  }

  if (convo.wsInsert(validData, ws)) {
    return validData;
  }
};

const wsMutate = (data) => {
  const exists = conversationExists(data.item);
  const thing = exists.wsInsert(exists, data);
  return thing;
};

const wsDelete = (data) => {
  const exists = getOne(data);
  conversations.splice(conversations.indexOf(exists), 1);
};

const getConversations = (res) => {
  handleResponse(
    200,
    {
      conversations,
      msg: !conversations.length ? "No conversations found." : "",
      ok: !conversations.length ? false : true,
    },
    res
  );
};

const deleteOne = ({ id }, res) => {
  let deleted = false;
  for (let item of conversations) {
    if (item.id === id) {
      conversations.splice(conversations.indexOf(item), 1);
      deleted = true;
    }
  }

  const error = {
    msg: "Conversation not found",
    ok: deleted,
  };
  handleResponse(deleted ? 204 : 400, deleted ? null : error, res);
};

const deleteAll = (res) => {
  const deleted = conversations.length ? (conversations = []) : false;
  const error = {
    ok: deleted,
    msg: "No conversations found",
  };
  handleResponse(deleted ? 204 : 400, deleted ? null : error, res);
};

const handleDelete = (req, res) => {
  const { query } = url.parse(req.url, true);
  return query.id ? deleteOne(query, res) : deleteAll(res);
};

module.exports = {
  getConversations,
  handleDelete,
  wsCreate,
  wsDelete,
  wsMutate,
};
