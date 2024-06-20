import Product from "../models/product.model.js";
import errorHandler from "../utils/error.js";

import { productCategories } from "../constants/data.js";


export const createProduct = async (req, res, next) => {

  const {
    name,
    description,
    location,
    storeAddress,
    type,
    categories,
    regularPrice,
    discountPrice,
    discount,
    imageUrls,
    mobile,
    unit,
    categoryData,
    userRef,
  } = req.body;

  const { categoryName, subCategories } = categoryData;

  try {
    
    const subCat = subCategories.map((name) => name);

      const newProduct = new Product({
        name,
        description,
        location,
        storeAddress,
        type,
        regularPrice,
        discountPrice,
        discount,
        imageUrls,
        mobile,
        unit,
        userRef,
        category: categoryName,
        subCategories: [...subCat],
      });

      const product = await newProduct.save();

    return res.status(201).json(product);

  } catch (error) {
    next(error);
  }
};


export const getCategories = async (req, res, next) => {
  try {

    const categories = await Product.aggregate([
      {
        $unwind: "$subCategories"
      },
      {
        $group: {
          _id: "$category",
          name: { $first: "$name" },
          category: { $first: "$category" },
          subCategories: { $addToSet: "$subCategories" },
          id: { $first: "$_id" }
        }
      },
      {
        $project: {
          _id: 0,
          name: 1,
          category: 1,
          subCategories: 1,
          id: 1
        }
      }
    ]);

    return res.status(200).json(categories);

  } catch (error) {
    next(error);
  }
};

export const getAllProductInCategory = async (req, res, next) => {
  
  try {

    const category = req.query.categories;

    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";


    const productsArray = await Product.aggregate([{ $sample: { size: 8 } }]);

    const allProducts = await Product.find()
      .sort({ [sort]: order })
      .skip(startIndex)
      .limit(limit);

    const products = category
      ? allProducts.filter((product) => product.categories === category)
      : allProducts;

    return res.status(200).json({ products: productsArray });
  } catch (error) {
    next(error);
  }
};

export const getAllProductInSubCategory = async (req, res, next) => {
  const { categoryName } = req.params;
  
  try {

    const products = await Product.find({ category: categoryName });
    
    let subCategories = [];
    if(products && products.length > 0) {
      subCategories = products.filter(product => 
        productCategories.some(subCategory => product.categories === subCategory.name)
      );
    }

    res.status(200).json({
      success: true,
      subCategories,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

export const getAllUserProduct = async (req, res, next) => {
  try {
    const products = await Product.find({ userRef: req.params.userId });
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

export const getCat = async (req, res, next) => {
  try {

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;


    const { location, category, subCategory, type, sort = "createdAt", order = "desc" } = req.query;

    const andConditions = [];
    const orConditions = [];

    if(location) {
      orConditions.push({ location: new RegExp(location, 'i') });
    }

    if(category) {
      orConditions.push({category: new RegExp(category, 'i')});
    }

    if(subCategory) {
      orConditions.push({subCategories: new RegExp(subCategory, 'i')});
    }

    if(type) {
      orConditions.push({ type: new RegExp(type, 'i') });
    }

    if (orConditions.length > 0) {
        andConditions.push({ $or: orConditions });
    }

    const filter = andConditions.length > 0 ? { $and: andConditions } : {};

    const products = await Product.find(filter)
      .sort({[sort]: order })
      .limit(limit)
      .skip(skip);

  

    const totalDoc = await Product.countDocuments(filter);

    return res.status(200).json({
      products,
      pagination: {
        total: totalDoc,
        limit,
        page,
        pages: Math.ceil(totalDoc / limit),
      }
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

export const searchProduct = async (req, res, next) => {


  try {
   
    const { location, category, subCategory, type, limit = 12, startIndex = 0 } = req.query;

    const distinctCategories = await Product.distinct('category');

    const andConditions = [];
    const orConditions = [];

    if(location) {
      orConditions.push({ location: new RegExp(location, 'i') });
    }

    if(category) {
      orConditions.push({category: new RegExp(category, 'i')});
    }

    if(subCategory) {
      orConditions.push({subCategories: new RegExp(subCategory, 'i')});
    }

    if(type) {
      orConditions.push({ type: new RegExp(type, 'i') });
    }

    if (orConditions.length > 0) {
        andConditions.push({ $or: orConditions });
    }

    const filter = andConditions.length > 0 ? { $and: andConditions } : {};

    const products = await Product.find(filter)
          .limit(limit)
          .skip(startIndex);
  

    res.status(200).json({
      success: true,
      data: {
        products: products ?? [],
        subCategories: distinctCategories ?? [],
      },
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "userRef",
      "-password"
    );

    if (!product) {
      return next(errorHandler(404, "Product not found"));
    }

    res.status(200).json({ product });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(errorHandler(401, "Product not found"));
  }

  if (req.user.id !== product.userRef) {
    return next;
  }

  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted");
  } catch (error) {
    next(error);
  }
};

export const editProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(errorHandler(404, "Product not found"));
  }

  if (req.user.id !== product.userRef) {
    return next(errorHandler(401, "You can only edit your own product!"));
  }

  try {
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updateProduct);
  } catch (error) {
    next(error);
  }
};
