const { JSDOM } = require("jsdom");
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf-8");
const dom = new JSDOM(html);
const header = dom.window.document.querySelector('.app-header-static');
console.log(header ? header.outerHTML : "NO HEADER");
