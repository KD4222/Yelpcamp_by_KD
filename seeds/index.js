const mongoose=require('mongoose');
const cities=require('./cities');
const Campground=require('../models/campground');
const{places,descriptors}=require('./seedHelpers');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/yelpCamp');
  console.log('DATABASE CONNECTED!');
}
//works in yelpcamp db if exists otherwise creates it for us.

const sample= (array=>array[Math.floor(Math.random()*array.length)]);

const seedDb=async()=>{
    await Campground.deleteMany({});
    for (let i=0;i<50;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            author: '62f09fbe9fb327821e3521cc',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            price,
            geometry:
            { type: 'Point', coordinates: [ cities[random1000].longitude,cities[random1000].latitude] },        
            images:[
                {
                  url: 'https://images-yelpcamp.s3.ap-south-1.amazonaws.com/o3IYeIq6Q-camppic.jpg',
                  filename: 'o3IYeIq6Q-camppic.jpg',
                },
                {
                  url: 'https://images-yelpcamp.s3.ap-south-1.amazonaws.com/kLcI6g6IcK-camppic2.jpg',
                  filename: 'kLcI6g6IcK-camppic2.jpg',
                }
              ],
              description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi ullam corporis id impedit repellendus, fugiat tempore vel alias porro eligendi quisquam doloremque illo? Totam, corrupti ex vero quibusdam quidem sequi?"
        })
        await camp.save();
    }
};
seedDb().then(()=>{
    mongoose.connection.close();
});