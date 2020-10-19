module.exports = (method, url) => {
  return (
    (url === "/ping" ||
      url === "/info" ||
      url === "/mutations" ||
      url.includes("/conversations")) &&
    (method === "GET" || method === "POST" || method === "DELETE")
  );
};
