const rewriter = new HTMLRewriter().on("div", { element(el) { el.setInnerContent("hi"); } });
const result = rewriter.transform("<div></div>");
console.log("Result type:", typeof result);
console.log("Result constructor:", result.constructor.name);
console.log("Result has text():", typeof result.text === "function");
const text = await result.text();
console.log("Result text:", text);
