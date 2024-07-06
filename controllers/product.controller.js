import Product from "../models/product.model.js";
import errorHandler from "../utils/error.js";
import { productCategories } from "../constants/data.js";
import User from "../models/user.model.js";
import { isValidObjectId } from "mongoose";

export const createProduct = async (req, res, next) => {
  const {
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
    categoryName,
    subCategories: { subCategories },
    userRef,
  } = req.body;

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
        $unwind: "$subCategories",
      },
      {
        $group: {
          _id: "$category",
          name: { $first: "$name" },
          category: { $first: "$category" },
          subCategories: { $addToSet: "$subCategories" },
          id: { $first: "$_id" },
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          category: 1,
          subCategories: 1,
          id: 1,
        },
      },
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
    if (products && products.length > 0) {
      subCategories = products.filter((product) =>
        productCategories.some(
          (subCategory) => product.categories === subCategory.name
        )
      );
    }

    res.status(200).json({
      success: true,
      subCategories,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUserProduct = async (req, res, next) => {
  try {
    const productPromise = Product.find({ userRef: req.params.userId });
    const userPromise = User.findById(req.params.userId).select("-password");

    const [products, user] = await Promise.all([productPromise, userPromise]);

    res.json({ success: true, products, user });
  } catch (error) {
    next(error);
  }
};

export const getCat = async (req, res, next) => {

  try {

    const { 
      name = "", 
      category = "", 
      subCategory = "",
      type = "",
      location = "",
      sort = "createdAt", 
      order = "desc", 
    } = req.query;


    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // const queryRegx = new RegExp(query, 'i');
    // const queryFilters = {
    //   $or: [
    //     { name: { $regex: queryRegx } },
    //     { location: { $regex: queryRegx } },
    //     { category: { $regex: queryRegx } },
    //     { subCategories: { $regex: queryRegx } },
    //     { type: { $regex: queryRegx } },
    //   ],
    // };
    
    let filter = {};

    if(name) {
      filter.name = { $regex: `.*${name}.*`, $options: 'i' }
    }

    if(category) {
      filter.category =  { $regex: `.*${category}.*`, $options: 'i' }
    }

    if(subCategory) {
      filter.subCategories =  { $regex: `.*${subCategory}.*`, $options: 'i' }
    }

    if(type) {
      filter.type =  { $regex: `.*${type}.*`, $options: 'i' }
    }
    
    if(location) {
      filter.location =  { $regex: `.*${location}.*`, $options: 'i' }
    }

    const totalDoc = await Product.countDocuments(filter);

    const products = await Product.find(filter)
    .sort({ [sort]: order })
    .limit(limit)
    .skip(skip);

    return res.status(200).json({
      products,
      pagination: {
        total: totalDoc,
        limit,
        page,
        pages: Math.ceil(totalDoc / limit),
      },
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

export const sellerProduct = async (req, res, next) => {

  const {sellerId} = req.params;

  const { 
    name = "", 
    location = "",
    category = "",
    limit = 12, 
    startIndex = 0, } = req.query;
  
  // const queryRegx = new RegExp(query, 'i');
    // const queryFilters = {
    //   userRef: sellerId,
    //   $or: [
    //     { name: { $regex: queryRegx } },
    //     { location: { $regex: queryRegx } },
    //     { category: { $regex: queryRegx } },
    //   ],
    // }

  try {

    if(!isValidObjectId(sellerId)) {
      return next(errorHandler(400, "Invalid sellerId"));
    }

    let filter = {
      userRef: sellerId,
    };
  
    if(name) {
      filter.name = { $regex: `.*${name}.*`, $options: 'i' }
    }
  
    if(location) {
      filter.location =  { $regex: `.*${location}.*`, $options: 'i' }
    }
  
    if(category) {
      filter.category =  { $regex: `.*${category}.*`, $options: 'i' }
    }

    const distinctCategories = await Product.distinct("category");

    const products = await Product.find(filter)
    .limit(limit)
    .skip(startIndex);

    res.status(200).json({
      success: true,
      data: {
        products,
        subCategories: distinctCategories ?? [],
      },
    });


  } catch (error) {
    next(error);
  }
};

export const searchProduct = async (req, res, next) => {

  const { 
    name = "", 
    location = "",
    category = "",
    subCategory = "",
    type = "",
    limit = 12, 
    startIndex = 0, } = req.query;
  
  // const queryRegx = new RegExp(query, 'i');

  try {

    const distinctCategories = await Product.distinct("category");

    // const queryFilters = {
    //   $or: [
    //     { name: { $regex: queryRegx } },
    //     { location: { $regex: queryRegx } },
    //     { category: { $regex: queryRegx } },
    //     { subCategories: { $regex: queryRegx } },
    //     { type: { $regex: queryRegx } },
    //   ],
    // }

    let filter = {};
  
    if(name) {
      filter.name = { $regex: `.*${name}.*`, $options: 'i' }
    }
  
    if(location) {
      filter.location =  { $regex: `.*${location}.*`, $options: 'i' }
    }

    if(category) {
      filter.category =  { $regex: `.*${category}.*`, $options: 'i' }
    }

    if(subCategory) {
      filter.subCategories =  { $regex: `.*${subCategory}.*`, $options: 'i' }
    }
  
    if(type) {
      filter.category =  { $regex: `.*${type}.*`, $options: 'i' }
    }

    const products = await Product.find(filter)
    .limit(limit)
    .skip(startIndex)

    res.status(200).json({
      success: true,
      data: {
        products,
        subCategories: distinctCategories ?? [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const marketSearch = async (req, res, next) => {

  const { 
    name = "", 
    location = "",
    category = "",
    limit = 12, 
    startIndex = 0, } = req.query;

  try {

    const distinctCategories = await Product.distinct("category");


    let filter = {};
  
    if(name) {
      filter.name = { $regex: `.*${name}.*`, $options: 'i' }
    }
  
    if(location) {
      filter.location =  { $regex: `.*${location}.*`, $options: 'i' }
    }
  
    if(category) {
      filter.category =  { $regex: `.*${category}.*`, $options: 'i' }
    }

    const products = await Product.find(filter)
    .limit(limit)
    .skip(startIndex)

    res.status(200).json({
      success: true,
      data: {
        products,
        subCategories: distinctCategories ?? [],
      },
    });
  } catch (error) {
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
  }
};

export const deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(errorHandler(401, "Product not found"));
  }

  if (req.user._id.toString() !== product.userRef.toString()) {
    return next(errorHandler(400, "You can only delete product your created"));
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

  if (req.user._id.toString() !== product.userRef.toString()) {
    return next(errorHandler(400, "You can only edit your own product!"));
  }

  try {
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};


// export const updateProduct = async (req, res, next) => {

//   const product = await Product.findById(req.params.id);

//   if (!product) {
//     return next(errorHandler(404, "Product not found"));
//   }

//   if (req.user._id.toString() !== product.userRef.toString()) {
//     return next(errorHandler(400, "You can only edit your own product!"));

//   }

//   try {
//     res.status(200).json(product);
//   } catch (error) {
//     next(error);
//   }
// };

export const updateProduct = async (req, res, next) => {

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(errorHandler(404, "Product not found"));
  }

  if (req.user?._id.toString() !== product.userRef.toString()) {
    return next(errorHandler(400, "You can only edit your own product!"));
  }

  try {
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {$set: req.body },
      { new: true }
    );

    res.status(200).json(updateProduct);
  } catch (error) {
    next(error);
  }
};
