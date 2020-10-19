const conversationModel = require("../models/conversationModel");

module.exports = isValidData = (data) => {
  console.log(data);
  const convKeys = Object.keys(conversationModel).sort(),
    dataKeys = Object.keys(JSON.parse(data)).sort();

  return (
    JSON.stringify(convKeys) === JSON.stringify(dataKeys) && JSON.parse(data)
  );
};
