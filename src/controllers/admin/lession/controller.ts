import asyncWrapper from "../../../utilities/async-wrapper";
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
} from "../../../errors";
import { Log } from "../../../utilities/debug";
import OtherUtils from "../../../utilities/other";
import { AWS_ADMIN_BUCKET } from "../../../constants";
import AWS from "../../../library/aws";
import Bluebird from "bluebird";
import AdminLession from "../../../models/admin/lession";
import { SS0017, SS0018, SS0019, SS0020 } from "../../../errors/errorCodes";

export const uploadFilesToS3 = asyncWrapper(async (req, res) => {
  let { data, courseId, moduleId, lessionId } = req.body;

  if (!data || data.length === 0 || !courseId || !moduleId || !lessionId) {
    res.status(409).json({ message: "No files received" });
  } else {
    Bluebird.map(data, function (file: any) {
      if (/data:image/gi.test(file.data)) {
        file.data = OtherUtils.removeExifData(
          Buffer.from(file.data, "binary").toString()
        );
      }

      let attachmentData = file.data.replace(/data:.*;base64,/, "");
      let bufferData = Buffer.from(attachmentData, "base64");

      let dataObj: any = new Object();
      dataObj.Bucket = AWS_ADMIN_BUCKET;
      dataObj.Body = bufferData;
      dataObj.Key = `${courseId}/${moduleId + "_moduleId"}/${
        lessionId + "_lessionId"
      }/${file.name}`;

      return AWS.putObject(dataObj, `${file.name}`).then(function (res) {
        return res;
      });
    }).then((resp) => {
      res.status(200).json({ message: "Uploaded successfully!" });
      return resp;
    });
  }
});

export const uploadContentDataToS3 = asyncWrapper(async (req, res) => {
  let { data, courseId, moduleId, lessionId } = req.body;

  if (!data || data.length === 0 || !courseId || !moduleId || !lessionId) {
    res.status(409).json({ message: "No files received" });
  } else {
    // Promise.map(data, function (file) {
    //   if (/data:image/gi.test(file.data)) {
    //     file.data = OtherUtils.removeExifData(
    //       Buffer.from(file.data, "binary").toString()
    //     );
    //   }

    //   let attachmentData = file.data.replace(/data:.*;base64,/, "");
    let bufferData = Buffer.from(data, "base64");

    let dataObj: any = new Object();
    dataObj.Bucket = "student-code-bucket-ss";
    dataObj.Body = data;
    dataObj.Key = `${courseId}/${moduleId + "_moduleId"}/${
      lessionId + "_lessionId"
    }/content.mdx`;

    return AWS.putObject(dataObj, `content.mdx`)
      .then(function (res) {
        return res;
      })
      .then((resp) => {
        res.status(200).json({ message: "Uploaded successfully!" });
        return resp;
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

export const getContentDataFromS3 = asyncWrapper(async (req, res) => {
  const {
    courseId = "PYTHON",
    moduleId = "613eb312c2da30198dd8aaa4",
    lessionId = "618631c2858cba4550b6a915",
  } = req.body;
  let objData: any = {};
  objData.bucketName = "admin-lessions-attachments";
  objData.region = "ap-south-1";
  objData.fileName = `${courseId}/${moduleId + "_moduleId"}/${
    lessionId + "_lessionId"
  }/content.mdx`;
  const mdxData = await AWS.promisifyGetAWSFileReadStream(
    objData.bucketName,
    objData.fileName
  );
  res.status(200).json({ data: Buffer.from(mdxData.Body).toString("utf8") });
});

export const getAdminLessons = asyncWrapper(async (req, res) => {
  try {
    const lessons = await AdminLession.find();

    res.status(200).json(lessons);
  } catch (error) {
    res.status(400).json({ message: "[SS0020] Something went wrong" });
    Log.error(error, `Error: ${SS0020}`);
  }
});

export const getLessonByCourseByModule = asyncWrapper(async (req, res) => {
  const { courseId, moduleId } = req.body;
  const lessons = await AdminLession.find({
    courseId: courseId,
    moduleId: moduleId,
  });

  try {
    if (lessons) {
      res.status(200).json(lessons);
    } else {
      res.status(201).json({
        message: `Lesson does not exist with the moduleID ${moduleId}`,
      });
    }
  } catch (error) {
    res.status(400).json({ message: "[SS0018] Something went wrong" });
    Log.error(error, `Error: ${SS0018}`);
  }
});

export const createAdminLesson = asyncWrapper(async (req, res) => {
  const lesson = req.body;
  const { courseId, moduleId, moduleLevel, lessionName } = req.body;
});

//   const createAdminLession = async (req, res) => {
// 	const lession = req.body;

// 	const { courseId, moduleId, moduleLevel, lessionName } = req.body;

// 	let exist;

// 	try {
// 	  const moduleDoc = await AdminModulesSchema.findOne({ courseId: courseId });
// 	  if (moduleDoc) {
// 		exist = moduleDoc[moduleLevel][0].lessions.filter(
// 		  (lession) => lession.name === lessionName
// 		);

// 		if (!exist[0]) {
// 		  const newLession = new AdminLessionsSchema(lession);
// 		  await newLession.save();

// 		  moduleDoc[moduleLevel]
// 			.filter((module) => module._id.toString() === moduleId)[0]
// 			.lessions.push({
// 			  _id: newLession._id,
// 			  disable: false,
// 			  lessionName: lessionName,
// 			});

// 		  await moduleDoc.save();
// 		  res.status(201).json({
// 			message: "Lession created & updated in modules!",
// 			id: newLession._id,
// 		  });
// 		} else {
// 		  res
// 			.status(201)
// 			.json({ message: "Lession already exists with same lession name" });
// 		}
// 	  }
// 	} catch (error) {
// 	  res.status(409).json({ message: error.message });
// 	}
//   };
