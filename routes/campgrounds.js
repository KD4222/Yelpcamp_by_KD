const express=require('express');
const router=express.Router({mergeParams:true});
const catchAsync=require('../utils/catchAsync');
const Campground=require('../models/campground');
const multer=require('multer');
// const upload=multer({storage});

const {upload}=require('../AWS-S3/index.js');

//controller
const campgrounds=require('../controllers/campgrounds');

//MIDDLEWARES
const {isLoggedIn,isAuthor,validateCampground}=require('../middleware');

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground) );

router.get('/new',isLoggedIn,campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit',isLoggedIn,isAuthor,upload.array('image'),catchAsync(campgrounds.renderEditForm));

module.exports=router;