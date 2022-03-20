/*objSavedResult
 * @module AWS library
 * @purpose resuable function for aws
 */

import AWS, { S3 } from "aws-sdk";
import Promise from "bluebird";
import { SS0017 } from "../errors/errorCodes";
import * as config from "../config/index";

AWS.config.update({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: config.region,
});

/*
 *  putObject
 * @author yash khandelwal
 */

const putObject = function (
  objData: any,
  file: string
): Promise<S3.PutObjectOutput | any> {
  return new Promise(function (resolve, reject) {
    let s3Client = new AWS.S3();

    // if (flgCompanyWise)
    //   objData.Key = objSaved.company + "/" + objSaved._id + objData.Key;
    // else objData.Key = objSaved._id + objData.Key;

    s3Client.putObject(objData, function (err, result) {
      if (err) {
        console.log(err);
        return reject(SS0017);
      } else {
        return resolve({ savedFile: file });
      }
    });
  });
};

// /*
//  * deleteImage
//  * @param {Object} @fields {name, id, type}
//  * @param {Object} result of the previous call back
//  */
// export const deleteImage = function (objIpData, arrResult) {
//   return new Promise(function (resolve, reject) {
//     let s3Client = new AWS.S3();
//     let awsInput = new Object();
//     awsInput["Bucket"] = IMAGE_BUCKET_NAME;
//     awsInput["Key"] = objIpData.data._id + objIpData.data.type;
//     s3Client.deleteObject(awsInput, function deleteHandler(err, data) {
//       if (err) {
//         console.log(__line, err);
//         return reject(["K00101002"]);
//       } else {
//         return resolve(data);
//       }
//     });
//   });
// };

// export const uploadCSVFileIntoAWS = function (strBucketName, fileName, buffer) {
//   let objMetadata = new Object();
//   objMetadata.Bucket = strBucketName;
//   objMetadata.Key = fileName;
//   objMetadata.Body = buffer;

//   let s3 = new AWS.S3();
//   return new Promise(function (resolve, reject) {
//     s3.putObject(objMetadata, function (err, result) {
//       if (err) {
//         console.log(__line, err);
//         return reject(["K00101002"]);
//       } else {
//         return resolve({ bucketName: strBucketName, fileName: fileName });
//       }
//     });
//   });
// };

// export const getAWSFileReadStream = function (
//   strBucketName,
//   fileName,
//   region = "ap-south-1"
// ) {
//   let objMetadata = new Object();
//   let s3 = new AWS.S3({ region });
//   objMetadata.Bucket = strBucketName;
//   objMetadata.Key = fileName;
//   return s3.getObject(objMetadata).createReadStream();
// };

/*
 *  putObject
 * @author yash khandelwal
 */

const promisifyGetAWSFileReadStream = function (
  strBucketName: string,
  fileName: string
): Promise<S3.GetObjectOutput | any> {
  return new Promise(function (resolve, reject) {
    let objMetadata: any = new Object();
    let s3 = new AWS.S3();
    objMetadata.Bucket = strBucketName;
    objMetadata.Key = fileName;
    //  return resolve(s3.getObject(objMetadata));
    return s3.getObject(objMetadata, function (err, data) {
      if (err) {
        console.log(err);
        return reject(SS0017);
      } else {
        // console.log("BE data - ", Buffer.from(data.Body).toString("utf8"));
        return resolve(data);
      }
    });
  });
};

// /**
//  *
//  * @param {*} company name
//  * @param {*} strBucketName  Aws bucket name
//  * @param {*} fileName filename stored in aws
//  * @description
//  *  to get buffer data from aws
//  */
// export const  getBufferObjectAWS = function (strBucketName, fileName) {
//   let objMetadata = new Object();
//   let s3 = new AWS.S3();

//   objMetadata.Bucket = strBucketName;
//   objMetadata.Key = fileName;

//   return new Promise(function (resolve, reject) {
//     s3.getObject(objMetadata, function (err, data) {
//       if (err) {
//         console.log(__line, err);
//         return reject(["K00101002"]);
//       } else {
//         return resolve(data);
//       }
//     });
//   });
// };

// export const checkFileExists = function (objFile) {
//   let filename = objFile._id.toString();
//   let fileType = objFile.type;
//   return new Promise(function (resolve, reject) {
//     let s3Client = new AWS.S3();
//     let awsInput = new Object();
//     awsInput["Bucket"] = IMAGE_BUCKET_NAME;
//     awsInput["Key"] = filename + fileType;
//     s3Client.deleteObject(awsInput, function deleteHandler(err, data) {
//       if (err) {
//         return resolve(data);
//       } else {
//         console.log("File exists");
//         return reject(["K00101002"]);
//       }
//     });
//   });
// };

// export const moveObjects =  function (bucketName, oldPrefix, newPrefix) {
//   if (!oldPrefix || !newPrefix || oldPrefix === "")
//     return Promise.reject(new Error("no data found"));
//   return new Promise((resolve, reject) => {
//     const s3Client = new AWS.S3();
//     const params = {
//       Bucket: bucketName,
//       Delimiter: "/",
//       Prefix: oldPrefix + "/",
//     };
//     s3Client.listObjectsV2(params, function (err, data) {
//       if (err) return reject("No objects for bucket folder");
//       if (
//         !data ||
//         (data && !data.Contents) ||
//         (data && data.Contents && !data.Contents.length)
//       )
//         return resolve();
//       return Promise.map(data.Contents, (el) => {
//         const copyParams = {
//           Bucket: bucketName,
//           CopySource: bucketName + "/" + el.Key,
//           Key: el.Key.replace(oldPrefix, newPrefix),
//         };
//         s3Client.copyObject(copyParams, (copyErr, copyDat) => {
//           if (copyErr) return reject("Not able to copy data");
//           return resolve();
//         });
//       });
//     });
//   });
// }

// export const invokeLambda = function({ fnName, region, invocationType, payload }) {
//   const lambda = new AWS.Lambda({
//     region,
//   });

//   const credentials = new AWS.Credentials(
//     process.env.AWS_ACCESS_KEY_ID,
//     process.env.AWS_SECRET_ACCESS_KEY
//   );

//   lambda.config.credentials = credentials;

//   const InvocationConfig = {
//     FunctionName: fnName,
//     InvocationType: invocationType,
//   };

//   if (payload) {
//     InvocationConfig["Payload"] = JSON.stringify(payload);
//   }

//   return lambda
//     .invoke(InvocationConfig)
//     .promise()
//     .then((res) => {
//       const payload = JSON.parse(res.Payload);
//       return payload;
//     });
// }

// export const generateSignedGETURL = function (
//   objData,
//   expiresIn = 900,
//   region = "us-east-1"
// ) {
//   return new Promise((resolve, reject) => {
//     const s3 = new AWS.S3({
//       region,
//       signatureVersion: "v4",
//     });
//     //Creating a local instance of credentials to overide the global creds that are being set.
//     const creds = new AWS.Credentials(
//       process.env.AWS_ACCESS_KEY_ID,
//       process.env.AWS_SECRET_ACCESS_KEY
//     );

//     s3.config.credentials = creds;

//     const params = {
//       Bucket: objData.Bucket,
//       Key: objData.Key,
//       Expires: expiresIn,
//       ResponseContentType: objData.ResponseContentType,
//     };

//     s3.getSignedUrl("getObject", params, (err, url) => {
//       if (err)
//         return reject(
//           new Error(`Error occured while generating signed url ${err}`)
//         );
//       else return resolve(url);
//     });
//   });
// };

// export const generateUploadSignedURL = function (
//   objData,
//   expiresIn = 900,
//   region = "us-east-1"
// ) {
//   return new Promise((resolve, reject) => {
//     const s3 = new AWS.S3({
//       region,
//       signatureVersion: "v4",
//     });

//     const creds = new AWS.Credentials(
//       process.env.AWS_ACCESS_KEY_ID,
//       process.env.AWS_SECRET_ACCESS_KEY
//     );

//     s3.config.credentials = creds;

//     const params = {
//       Bucket: objData.Bucket,
//       Key: objData.Key,
//       Expires: expiresIn,
//       ContentType: objData.ContentType,
//     };

//     s3.getSignedUrl("putObject", params, (err, url) => {
//       if (err)
//         return reject(
//           new Error(`Error occured while generating signed url ${err}`)
//         );
//       else return resolve(url);
//     });
//   });
// };

// export const deleteS3Object = function (objData, region = "us-east-1") {
//   return new Promise(function (resolve, reject) {
//     const s3 = new AWS.S3({ region });
//     const params = {
//       Bucket: objData.Bucket,
//       Key: objData.Key,
//     };

//     const creds = new AWS.Credentials(
//       process.env.AWS_ACCESS_KEY_ID,
//       process.env.AWS_SECRET_ACCESS_KEY
//     );

//     s3.config.credentials = creds;

//     s3.deleteObject(params, function deleteHandler(err, data) {
//       if (err) {
//         console.log(__line, err);
//         return reject(new Error(["K00101002"]));
//       } else {
//         return resolve(data);
//       }
//     });
//   });
// };

export default { putObject, promisifyGetAWSFileReadStream };
