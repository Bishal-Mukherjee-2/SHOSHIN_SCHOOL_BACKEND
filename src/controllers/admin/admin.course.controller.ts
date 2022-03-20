import asyncWrapper from "../../utilities/async-wrapper";
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
} from "../../errors";
import { Log } from "../../utilities/debug";
import {
  SS0001,
  SS0002,
  SS0003,
  SS0004,
  SS0005,
} from "../../errors/errorCodes";
import { Course } from "../../models/course.model";

import DataModel, { QueryType } from "../../helpers/DataModel";
import { DB_COLLECTIONS, DB_CONSTANTS } from "../../constants";
import { mongoose } from "@typegoose/typegoose";

// @desc      Create Course
// @route     POST /admin/createCourse
// @access    Private
export const createCourse = asyncWrapper((req, res) => {
  const course = req.body;
  const { courseId } = req.body;

  const objQuery: any = new Object();

  objQuery.courseId = courseId;

  const CourseModelFind = new DataModel<Course>(
    DB_COLLECTIONS.COURSE_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    objQuery
  );

  return CourseModelFind.exec()
    .then((exist): Promise<any> => {
      if (!exist) {
        const CourseModel = new DataModel(
          DB_COLLECTIONS.COURSE_MODEL,
          DB_CONSTANTS.CREATE_ACTION
        );
        CourseModel.setDocToUpdate(course);
        CourseModel.exec().then((doc) => {
          doc.save().then(() => {
            res.status(201).json({
              message: `Course created successfully!`,
            });
            return doc;
          });
        });
        return Promise.resolve({});
      } else {
        res.status(201).json({
          message: `Course already exists with same courseID ${courseId}`,
        });
        return Promise.resolve({});
      }
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0001] Something went wrong" });
      Log.error(error, `Error: ${SS0001}`);
    });
});

// @desc      Get Courses
// @route     GET /admin/getCourses
// @access    Private
export const getCourses = asyncWrapper((req, res) => {
  const CourseModel = new DataModel<Course>(
    DB_COLLECTIONS.COURSE_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND,
    {}
  );

  return CourseModel.exec()
    .then((courses): Promise<any> => {
      res.status(200).json(courses);
      return Promise.resolve({});
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0002] Something went wrong" });
      Log.error(error, `Error: ${SS0002}`);
    });
});

// @desc      Get Course By CourseID
// @route     POST /getCourseById
// @access    Private
export const getCourseById = asyncWrapper((req, res) => {
  const { courseId } = req.body;

  const objQuery: any = new Object();

  objQuery.courseId = courseId;

  const CourseModel = new DataModel<Course>(
    DB_COLLECTIONS.COURSE_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    objQuery
  );

  return CourseModel.exec()
    .then((result): Promise<any> => {
      if (result) {
        res.status(201).json(result);
        return Promise.resolve();
      } else {
        res.status(201).json({
          message: `Course does not exist with the courseID ${courseId}`,
        });
        return Promise.resolve({});
      }
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0003] Something went wrong" });
      Log.error(error, `Error: ${SS0003}`);
    });
});

// @desc      Edit Course By finding course using _id
// @route     POST /admin/editCourse/:id
// @access    Private
export const editCourse = asyncWrapper((req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(201).json({ message: "Course ID is missing!" });
  }

  const objQuery: any = new Object();
  objQuery.id = new mongoose.Types.ObjectId(id.toString());

  const course = req.body;

  const CourseModel = new DataModel<Course>(
    DB_COLLECTIONS.COURSE_MODEL,
    DB_CONSTANTS.UPDATE_ACTION,
    DB_CONSTANTS.FIND_BY_ID_UPDATE,
    objQuery
  );

  CourseModel.setDocToUpdate({ $set: course });

  return CourseModel.exec()
    .then((result): Promise<any> => {
      if (result) {
        res.status(201).json({ message: "Course Updated Successfully!" });
        return Promise.resolve({});
      }
      return Promise.resolve({});
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0004] Something went wrong" });
      Log.error(error, `Error: ${SS0004}`);
    });
});

// @desc      Delete Course By finding course using _id
// @route     POST /admin/deleteCourse/:id
// @access    Private
export const deleteCourse = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(201).json({ message: "Course ID is missing!" });
  }

  const objQuery: any = new Object();
  objQuery._id = new mongoose.Types.ObjectId(id.toString());

  const CourseModel = new DataModel<Course>(
    DB_COLLECTIONS.COURSE_MODEL,
    DB_CONSTANTS.DELETE_ACTION,
    undefined,
    objQuery
  );

  return CourseModel.exec()
    .then((result): Promise<any> => {
      res.status(201).json({ message: "Course Deleted Successfully!" });
      return Promise.resolve({});
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0005] Something went wrong" });
      Log.error(error, `Error: ${SS0005}`);
    });
});
