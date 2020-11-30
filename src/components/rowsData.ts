import faker from "faker";

// Table data as an array of objects
export const list = new Array(100).fill(true).map(() => ({
  department: faker.commerce.department(),
  productName: faker.commerce.productName(),
  price: faker.commerce.price(),
  productAdjective: faker.commerce.productAdjective(),
  productMaterial: faker.commerce.productMaterial(),
  product: faker.commerce.product(),
  productDescription: faker.commerce.productDescription(),
  color: faker.commerce.color(),
  id: faker.random.alphaNumeric(11),
  quantities: faker.random.arrayElements([10, 20, 30, 40, 50, 60], 6)
}));