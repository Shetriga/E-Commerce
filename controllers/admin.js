const mongoose = require('mongoose');
const fileHelper = require('../util/file');

const { validationResult } = require('express-validator/check');

const Product = require('../models/product');
const Section = require('../models/section');

exports.getAddProduct = async (req, res, next) => {
  const cats = await Section.find();
  console.log(cats);
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
    categories: cats
  });
};

exports.postAddProduct = async (req, res, next) => {
  const cats = await Section.find();
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const category = req.body.category;
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: [],
      categories: cats
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        imageUrl: image.path,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      categories: cats
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    category: category,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    if(!product) {
      return next(new Error('Product not found!'));
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({ _id: prodId, userId: req.user._id })
  })
  .then(() => {
    console.log('DESTROYED PRODUCT');
    res.status(200).json({
      message: "Success!"
    });
  })
  .catch(err => {
    res.status(500).json({
      message: "Deleting product failed!"
    });
  });
};

exports.getAddSection = (req, res, next) => {
  res.render('admin/edit-section', {
    pageTitle: 'Add Section',
    errorMessage: null,
    path: '/admin/add-section',
    editing: false,
    validationErrors: [],
    hasError: false
  });
};

exports.postAddSection = (req, res, next) =>{
  const name = req.body.name;
  const image = req.file;
  if(!image) {
    return res.render('admin/edit-section', {
      pageTitle: 'Add Section',
      path: '/admin/add-section',
      errorMessage: 'No Image Attached',
      hasError: true,
      validationErrors: [],
      editing: false,
      section: {
        name: name
      }
    });
  }

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.render('admin/edit-section', {
      pageTitle: 'Add Section',
      path: '/admin/add-section',
      errorMessage: errors.array()[0].msg,
      hasError: true,
      validationErrors: errors.array(),
      editing: false,
      section: {
        name: name
      }
    });
  }

  const imageUrl = image.path;

  const newSection = new Section({
    name: name,
    imageUrl: imageUrl
  });
  return newSection.save()
  .then(saved => {
    console.log('Saved Section Successfully!');
    res.redirect('/');
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};