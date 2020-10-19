const headers = {
  "Access-Control-Allow-Origin": "https://app.ava.me",
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
  "Access-Control-Max-Age": 2592000,
  "Content-Type": "application/json",
};

module.exports = (code, msg, res) => {
  res.writeHead(code, headers);
  res.end(JSON.stringify(msg));
};
