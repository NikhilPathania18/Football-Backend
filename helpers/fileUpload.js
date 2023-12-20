import aws from 'aws-sdk'
import cloudinary from 'cloudinary'
import DataUriParser from 'datauri/parser.js'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

cloudinary.v2.config({ 
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME, 
  api_key: process.env.CLOUDINARY_CLIENT_API, 
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET
});

aws.config.update({
  accessKeyId: "AKIAY3L35MCRZNIRGT6N",
  secretAccessKey: "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",
  // accessKeyId: "AKIAZI6IM5CP4QVM6IZG",
  // secretAccessKey: "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",
  region: "ap-south-1",
});

let uploadFile = async (file, rollNo) => {
  console.log('file',file)
  if(!file) return;
  return new Promise(function (resolve, reject) {
    // this function will upload file to aws and return the link
    let s3 = new aws.S3({ apiVersion: "2006-03-01" }); // we will be using the s3 service of aws

    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",
      Key: "player/" + rollNo + Date.now(),
      Body: file.buffer,
    };
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        console.log('error',err)
        return reject({ error: err });
      }

      console.log('data', data)
      return resolve(data.Location);
    });
  });
};

const uploadFileCloudinary = async(file) => {

    const parser = new DataUriParser();
    const extName = path.extname(file.originalname).toString();
    const dataUri =  parser.format(extName, file.buffer)

    return (await cloudinary.v2.uploader.upload(dataUri.content)).url;
}

export default uploadFileCloudinary