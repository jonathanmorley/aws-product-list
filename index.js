#!/usr/bin/env node

import got from "got";
import { JSDOM } from "jsdom";
import groupBy from "lodash.groupby";

const baseUrl = new URL("https://aws.amazon.com/products");

const dom = await got(baseUrl).then(({ body }) => new JSDOM(body));
const productNodes = [
  ...dom.window.document.querySelectorAll(".lb-content-item"),
];

const products = productNodes
  .map((productNode) => {
    return {
      name: productNode.querySelector("span").textContent,
      link: new URL(productNode.querySelector("a").href, baseUrl).href,
      summary: productNode.querySelector("cite").textContent,
      category:
        productNode.parentNode.parentNode.querySelector("span").textContent,
    };
  })
  .sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

const grouped = Object.entries(
  groupBy(products, (product) => product.name)
).map(([k, vs]) => {
  return {
    name: k,
    link: vs[0].link,
    summary: vs[0].summary,
    categories: vs.map((v) => v.category),
  };
});

console.dir(grouped, { maxArrayLength: null });
