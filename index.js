const http = require("http");
const path = require("path");
const fs = require("fs");
const qs = require("querystring");

const notFound = (req, res) => {
  fs.readFile(path.join(__dirname, "404.html"), (err, data) => {
    if (err) {
      res.write(404, "not found");
    } else {
      res.writeHead(404, { "Content-Type": 'text/html;charset="utf-8"' });
      res.write(data);
      res.end();
    }
  });
};

const writeDb = chunk => {
  fs.appendFile(path.join(__dirname, "db"), chunk, er => {
    if (err) {
      throw err;
    }
    console.log("db insert", chunk && chunk.toString());
  });
};

http
  .createServer((req, res) => {
    // 1.路由处理
    // 2.静态资源托管
    // 3.HTTP verb
    // 4.store

    const myURL = new URL("http:localhost:9000" + req.url);
    let pathName = myURL.pathname;

    if (pathName.startsWith("/api")) {
      const method = req.method;
      if (method === "GET") {
        const query = {};
        myURL.searchParams.forEach((value, name) => {
          query[name] = value;
        });
        const resData = {
          code: 200,
          msg: "sucess",
          data: query
        };
        res.end(JSON.stringify(resData));
        return;
      }
      if (method === "POST") {
        const contentType = req.headers["content-type"];
        if (contentType === "application/json") {
          let postData = "";
          req.on("data", chunk => {
            postData += chunk;
            writeDb(chunk);
          });
          req.on("end", () => {
            res.end(postData);
          });
        }
      }
    }

    if (pathName === "/") {
      pathName = path.join(__dirname, "index.html");
    }

    const extName = path.extname(pathName);

    if (extName === ".html") {
      fs.readFile(pathName, (err, data) => {
        if (err) {
          notFound(req, res);
        } else {
          res.writeHead(200, { "Content-Type": 'text/html;charset="utf-8"' });
          res.write(data);
          res.end();
        }
      });
    }
  })
  .listen(9000);
