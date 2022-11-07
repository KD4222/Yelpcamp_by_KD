//Require AWS library
const express = require('express');
const multer = require('multer');
const multerS3=require('multer-s3');
require('dotenv').config();
const S3=require('aws-sdk/clients/s3')
const fs=require('fs');
const path=require('path');
const url=require('url');
const shortid = require('shortid');

const app = express();

const bucketName=process.env.AWS_BUCKET_NAME
const region=process.env.AWS_BUCKET_REGION
const accessKeyId=process.env.AWS_ACCESS_KEY
const secretAccessKey=process.env.AWS_SECRET_KEY

s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey,
})


module.exports.upload=multer({
    storage: multerS3({
      s3: s3,
      bucket: 'images-yelpcamp',
      //ACL-access
      ACL:'public-read',
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        cb(null,shortid.generate()+"-"+file.originalname)
      }
    })
  });

module.exports.deleteObject=async function(params){
  const deleting =await s3.deleteObject(params,function(err,data){
    if(err)console.log(err);
  })
}
// module.exports.uploadFile= (file)=>{
//   file.path=path.basename(url.parse(file).path);
//   const fileStream=fs.createReadStream(path.join(__dirname,file.path))
//   const uploadParams={
//     Bucket:bucketName,
//     Body:fileStream,
//     Key: file.fileName
//   }
//   return storage.upload(uploadParams).promise()
//   //for returning a promise rather than a callback function
// }

// module.exports.storage=storage;











// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_KEY,
//     api_secret:process.env.CLOUDINARY_SECRET
// });

// const storage=new CloudinaryStorage({
//     cloudinary,
//     params:{
//     folder:'YelpCamp',
//     allowedFormats: ['jpeg','png','jpg']
//     }
// });

// module.exports={
//     cloudinary,
//     storage
// }