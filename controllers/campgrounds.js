const Campground=require('../models/campground');
const {deleteObject}=require('../AWS-S3/index')
const mapBoxToken=process.env.MAPBOX_TOKEN;
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");

const geocoder=mbxGeocoding({accessToken:mapBoxToken});

module.exports.index=async(req,res,next)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}

module.exports.renderNewForm=(req,res)=>{
    res.render('campgrounds/new');
}

module.exports.createCampground= async(req,res,next)=>{
    const geoData= await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    const campground=new Campground(req.body.campground);
    campground.geometry=geoData.body.features[0].geometry;
    campground.author= req.user._id;
    campground.images=req.files.map(f=>({url:f.location,filename:f.key}));
    await campground.save();
    console.log(campground);
    req.flash('success','Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground= async (req,res)=>{
    const campground=await Campground.findById(req.params.id).populate({path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error',"Can't find that campground!")
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground})
}

module.exports.renderEditForm=async(req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    if(!campground){
        req.flash('error',"Can't find that campground!")
        return res.redirect('/campgrounds');
    };
    res.render('campgrounds/edit',{campground});
}

module.exports.updateCampground=async(req,res)=>{
    const{id}=req.params;
    console.log(req.body);
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs=req.files.map(f=>({url:f.location,filename:f.key}))
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(img of req.body.deleteImages){
            const params={Bucket:'images-yelpcamp',Key:`${img.filename}`}
            deleteObject(params);
        }
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});
        console.log(campground);
    }
    req.flash('success',"Successfully updated the campground!")
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground= async (req,res)=>{
    const{id}=req.params;
    await Campground.findByIdAndDelete(id);
    //triggers findOneAndDelete() middleware
    req.flash('success','Successfully deleted the campground!')
    res.redirect('/campgrounds');
}