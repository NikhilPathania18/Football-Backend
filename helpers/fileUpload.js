import aws from 'aws-sdk'
import cloudinary from 'cloudinary'

cloudinary.config({ 
  cloud_name: 'dksin9cm5', 
  api_key: '518895216966278', 
  api_secret: 'dyrhi30grRUQ9zSah9-i_I0jofk',
  secure: true 
});

aws.config.update({
  // accessKeyId: "AKIAY3L35MCRZNIRGT6N",
  // secretAccessKey: "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",
  accessKeyId: "AKIAZI6IM5CP4QVM6IZG",
  secretAccessKey: "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",
  region: "ap-south-1",
});

let uploadFile = async (file, rollNo) => {
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
        return reject({ error: err });
      }
      return resolve(data.Location);
    });
  });
};

const uploadFileCloudinary = async(file) => {
  if(!file) return;

  let imageUrl
  console.log(file);
  cloudinary.uploader.upload(file.tempFilePath,(err,result)=>{
    console.log(err)
    if(err) return;
    console.log(result)
    return result;
  })
}

export default uploadFile