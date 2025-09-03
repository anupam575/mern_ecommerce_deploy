import cloudinary from "cloudinary";
import Product from "../models/productModel.js";

// Create Product -- Admin
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;

    let imagesLinks = [];

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images: imagesLinks,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Products
export const getAllProducts = async (req, res, next) => {
  try {
    const resultPerPage = 8;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    const queryCopy = { ...req.query };
    ["keyword", "page", "limit"].forEach((key) => delete queryCopy[key]);

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    const filters = JSON.parse(queryStr);

    const productsCount = await Product.countDocuments();
    const filteredProductsCount = await Product.countDocuments({ ...keyword, ...filters });

    const skip = resultPerPage * (page - 1);
    const products = await Product.find({ ...keyword, ...filters })
      .limit(resultPerPage)
      .skip(skip);

    res.status(200).json({
      success: true,
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Admin Products
export const getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get Admin Products Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Product Details
export const getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Get Product Details Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Product
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { name, description, price, category, stock } = req.body;
    let imagesLinks = product.images;

    if (req.file) {
      if (product.images && product.images.length > 0) {
        await cloudinary.v2.uploader.destroy(product.images[0].public_id);
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: "products" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      imagesLinks = [{ public_id: result.public_id, url: result.secure_url }];
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, stock, images: imagesLinks },
      { new: true, runValidators: true, useFindAndModify: false }
    );

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Product -- Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Product Deleted Successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create or Update Review
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productId);
    console.log("Review Section Product ID:", productId);

    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => (avg += rev.rating));
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Create Product Review Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Reviews
export const getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    console.error("Get Product Reviews Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Review
export const deleteReview = async (req, res, next) => {
  try {
    console.log("Query Params:", req.query);
    console.log("User from req.user:", req.user);

    const product = await Product.findById(req.query.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const reviewToDelete = product.reviews.find(
      (rev) => rev._id.toString() === req.query.id.toString()
    );
    if (!reviewToDelete) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    if (reviewToDelete.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can't delete this review" });
    }

    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;
    reviews.forEach((rev) => (avg += rev.rating));

    const ratings = reviews.length === 0 ? 0 : avg / reviews.length;
    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
      req.query.productId,
      { reviews, ratings, numOfReviews },
      { new: true, runValidators: true, useFindAndModify: false }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete Review Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
