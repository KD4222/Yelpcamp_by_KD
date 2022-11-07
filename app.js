//running it in development environment 
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


// console.log(process.env.CLOUDINARY_CLOUD_NAME);

const express=require('express');
const app=express();
const session=require('express-session');
const path=require('path');
const mongoose=require('mongoose');
const Campground=require('./models/campground');
const ExpressError=require('./utils/ExpressError')
const User=require('./models/user');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const methodOverride=require('method-override');
const MongoDBStore=require("connect-mongo");

const {campgroundSchema,reviewSchema}=require('./schemas.js');
const ejsMate=require('ejs-mate');
const flash=require('connect-flash');
const Review=require('./models/review')

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes=require('./routes/users');
const campgroundRoutes=require('./routes/campgrounds')
const reviewRoutes=require('./routes/reviews');

const helmet=require('helmet');

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(mongoSanitize({
    replaceWith:'_'
}));

const dbUrl=process.env.DB_URL;
// const dbUrl='mongodb://localhost:27017/yelpCamp';

const store=MongoDBStore.create({
     mongoUrl:dbUrl,
     secret:'ThisIsASecret',
     touchAfter:24*3600,
 });

//to look for errors
 store.on("error",function(e){
     console.log("session store error",e);
 });

 const secret=process.env.SECRET||"ThisIsASecret";
 //SETTING UP SESSION
const sessionConfig={
    store,
    name:'session',
    secret:secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7,
    }
}

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
  console.log('DATABASE CONNECTED!');
}
// //works in yelpcamp db if exists otherwise creates it for us.


app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({
    crossOriginEmbedderPolicy:false
}));


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://images-yelpcamp.s3.ap-south-1.amazonaws.com/", //my aws account 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


//SETTING UP PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//Storing and unstoring use in a session using passport-local-mongoose strat
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    if(!['/login','/'].includes(req.originalUrl)){
        req.session.returnTo=req.originalUrl;
    };
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
});

//for using express router routes
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);
app.use('/',userRoutes);


app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
//serving static assets
app.use(express.static(path.join(__dirname,'public')));

app.get('/',(req,res)=>{
    res.render('home');
});


app.all('*',(req,res,next)=>{
    next(new ExpressError('page not found',404));
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message)err.message='Oh no Something went wrong';
    res.status(statusCode).render('error',{err});
    
});

app.listen(3000,()=>{
    console.log("listening on port 3000");
});

