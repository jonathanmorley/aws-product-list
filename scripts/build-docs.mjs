import fs from "node:fs";
import he from "he";

const productsUrl = new URL(
  "https://aws.amazon.com/api/dirs/items/search?item.directoryId=aws-products&item.locale=en_US&size=1000"
);

const { items } = await fetch(productsUrl).then((res) => res.json());

const products = items.map(({ item, tags }) => ({
  id: item.name,
  name: item.additionalFields.productName,
  summary: he
    .decode(item.additionalFields.productSummary)
    .replaceAll(/<\/?p>/g, "")
    .replaceAll('\u2019', "'")
    .trim(),
  category: item.additionalFields.productCategory,
  type: tags.find((tag) => tag.tagNamespaceId === "aws-products#type")
    .description,
}));

await fs.promises.mkdir("docs", { recursive: true });
await fs.promises.writeFile(
  "docs/products.json",
  JSON.stringify(products, undefined, 2)
);
