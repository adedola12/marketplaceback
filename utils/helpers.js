import { array1, productCategories } from "../constants/data";

export const mergedArray = array1.map(item => {
    const matchingCategory = productCategories.find(category => category.name === item.name);
    if (matchingCategory) {
      return { ...item, subCategories: matchingCategory.subCategories };
    }
    return item;
  });
  