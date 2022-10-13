import fs from "node:fs";

const productsUrl = new URL(
  "https://aws.amazon.com/api/dirs/items/search?item.directoryId=aws-products&item.locale=en_US&size=1000"
);

const { items } = await fetch(productsUrl).then((res) => res.json());

const products = items.map(({ item }) => ({
  id: item.name,
  name: item.additionalFields.productName,
  summary: item.additionalFields.productSummary,
  category: item.additionalFields.productCategory,
}));

await fs.promises.mkdir("docs", { recursive: true });
await fs.promises.writeFile(
  "docs/products.json",
  JSON.stringify(products, undefined, 2)
);
