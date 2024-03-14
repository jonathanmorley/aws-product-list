import fs from "node:fs";
import he from "he";

async function* fetchItems(pageSize = 100) {
  const productsUrl = new URL("https://aws.amazon.com/api/dirs/items/search");
  productsUrl.searchParams.set("item.directoryId", "aws-products");
  productsUrl.searchParams.set("item.locale", "en_US");
  productsUrl.searchParams.set(
    "tags.id",
    "aws-products#type#service|aws-products#type#feature"
  );
  productsUrl.searchParams.set("size", pageSize);

  let page = 0;
  while (true) {
    productsUrl.searchParams.set("page", page++);

    const response = await fetch(productsUrl);
    const body = await response.json();

    if (body.items.length === 0) break;
    yield* body.items;
  }
}

const products = [];
for await (const { item, tags } of fetchItems()) {
  products.push({
    id: item.name,
    name: item.additionalFields.productName,
    summary: he
      .decode(item.additionalFields.productSummary)
      // HTML tags
      .replaceAll(/<\/?p>/g, "")
      // Smart quotes
      .replaceAll("\u2018", "'")
      .replaceAll("\u2019", "'")
      // Zero-width space
      .replaceAll("\u200b", "")
      .trim(),
    category: item.additionalFields.productCategory,
    type: tags.find((tag) => tag.tagNamespaceId === "aws-products#type").name,
  });
}

await fs.promises.mkdir("docs", { recursive: true });
await fs.promises.writeFile(
  "docs/products.json",
  JSON.stringify(products, undefined, 2)
);
