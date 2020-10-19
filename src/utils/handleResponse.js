const headers = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

module.exports = (code, msg, res) => {
  res.writeHead(code, headers);
  res.end(JSON.stringify(msg));
};
