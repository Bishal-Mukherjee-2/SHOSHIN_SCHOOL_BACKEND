import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  editCourse,
  deleteCourse,
} from "../controllers/admin/admin.course.controller";
import {
  createNewSection,
  getSectionByCourseId,
} from "../controllers/admin/admin.section.controller";
import {
  createUpdateModule,
  getModuleDashboard,
} from "../controllers/student/student.module.controller";
import {
  createModule,
  editModule,
  getAllModules,
  getModuleByCourseId,
} from "../controllers/admin/admin.module.controller";
import { tempFun } from "../controllers/temp.controller";
import {
  getAllInstructors,
  createInstructor,
  editInstructor,
  getInstructorById,
  getInstructorByEmail,
} from "../controllers/admin/instructor/controller";
import { protectedRoute } from "../middleware/auth";
import {
  raiseDoubt,
  getDoubts,
} from "../controllers/student/student.doubt.contoller";
import {
  fetchNotifications,
  readAllNotifications,
  deleteAllNotifications,
} from "../controllers/notifications/contoller";
import {
  registerStudent,
  studentLogin,
  toggleRedirectAdmin,
} from "../controllers/student/student.profile.controller";
import {
  codeExecution,
  setupTestCases,
} from "../controllers/codeexecution/controller";
import passport from "passport";

const router = express.Router();

// router.use(protectedRoute);

router.route("/user/updateAdminRedirect").patch(toggleRedirectAdmin);

/************************************* APIS WRITTED WITH DBMODULE **************************************/
// @desc      Admin Courses routes
// @access    Private
router.route("/admin/createCourse").post(createCourse);
router.route("/admin/getCourses").get(getCourses);
router.route("/admin/getCourseById").post(getCourseById);
router.route("/admin/editCourse/:id").post(editCourse);
router.route("/admin/deleteCourse/:id").post(deleteCourse);

// @desc      Admin Module sections routes
// @access    Private
router.route("/admin/createNewSection").post(createNewSection);
router.route("/admin/getSectionByCourseId").post(getSectionByCourseId);

// @desc      Admin Module routes
// @access    Private
router.route("/admin/createModule").post(createModule);
router.route("/admin/editModule").post(editModule);
router.route("/admin/getAllModules").get(getAllModules);
router.route("/admin/getModuleByCourseId").post(getModuleByCourseId);

// @desc      Student Module routes
// @access    Private
router.post("/student/login", passport.authenticate("local"), studentLogin);
router.route("/student/registerStudent").post(registerStudent);
router.route("/student/createUpdateModule").post(createUpdateModule);
router.route("/student/getModulesDashboard").post(getModuleDashboard);

/************************************* APIS WRITTED WITH DBMODULE **************************************/

// @desc      Admin Instructors routes
// @access    Private
router.route("/admin/instructor").post(createInstructor);
router.route("/admin/instructors").post(getAllInstructors);
router.route("/admin/instructor/:id").post(editInstructor);
router.route("/admin/instructor/by/id").post(getInstructorById);
router.route("/admin/instructor/by/email").post(getInstructorByEmail);

// @desc      Admin Modules routes
// @access    Private
// router.route("/admin/getModules").get(getModules);
// router.route("/admin/getModuleByCourseId").post(getAdminModuleById);
// router.route("/admin/modules").post(createModules);
// router.route("/admin/modules/:courseId/:level").patch(pushNewModule);
// router.route("/admin/modules/:courseId/:level/:_id").patch(editModule);
// router
//   .route("/admin/modules/disable/:courseId/:level/:_id")
//   .patch(disableModule);

// @desc Doubt Module routes
router.route("/raiseDoubt").post(raiseDoubt);
router.route("/getDoubt/:studentEmail").get(getDoubts);

router.route("/student/code-execution").post(codeExecution);
router.route("/setUpTestCases").post(setupTestCases);
router.route("/fetchNotifications").post(fetchNotifications);
router.route("/readAllNotifications").post(readAllNotifications);
router.route("/deleteAllNotifications").post(deleteAllNotifications);

router.route("/temp").post(tempFun);

export default router;
