module.exports = (code, msg, res) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(msg));
};
