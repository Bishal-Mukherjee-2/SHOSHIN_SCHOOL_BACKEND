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
import { ModuleTemplate } from "../../models/moduletemplate.model";
import { StudentModule } from "../../models/studentmodule.model";
import { sectionByCourseId } from "../../controllers/admin/admin.section.controller";

import DataModel, { QueryType } from "../../helpers/DataModel";
import { DB_COLLECTIONS, DB_CONSTANTS } from "../../constants";
import { mongoose } from "@typegoose/typegoose";

// @desc      Create/Update student module
// @route     POST /student/createUpdateModule
// @access    Private

export const createUpdateModule = asyncWrapper((req: any, res: any) => {
  const { courseId, emailId } = req.body;
  const objQuery: any = new Object();
  objQuery.courseId = courseId;
  objQuery.emailId = emailId;
  const StudentModuleModelFind = new DataModel<StudentModule>(
    DB_COLLECTIONS.STUDENT_MODULE_MODULE,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    objQuery
  );

  const objQueryTemplate: any = new Object();
  objQueryTemplate.courseId = courseId;

  const ModuleTemplateModelFind = new DataModel<ModuleTemplate>(
    DB_COLLECTIONS.MODULE_TEMPLATE_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    objQueryTemplate
  );

  return StudentModuleModelFind.exec()
    .then((exist): Promise<any> => {
      if (exist) {
        return ModuleTemplateModelFind.exec().then((template) => {
          const templateModules: any = { ...template.modules };

          Object.keys(templateModules).forEach((key) => {
            if (key in exist.modules) {
              templateModules[key] = exist.modules[key];
            } else {
              templateModules[key] = { studentScore: 0 };
            }
          });

          const StudentModuleModelCreate = new DataModel<StudentModule>(
            DB_COLLECTIONS.STUDENT_MODULE_MODULE,
            DB_CONSTANTS.UPDATE_ACTION,
            DB_CONSTANTS.FIND_ONE_UPDATE,
            { courseId: courseId }
          );

          StudentModuleModelCreate.setDocToUpdate({
            $set: { modules: templateModules },
          });

          return StudentModuleModelCreate.exec().then((result) => {
            res.status(201).json({ message: "Updated modules for student" });
            return result;
          });
        });
      } else {
        return ModuleTemplateModelFind.exec().then((template) => {
          const templateModules: any = { ...template.modules };

          Object.keys(templateModules).forEach((key) => {
            templateModules[key] = { studentScore: 0 };
          });

          const newStudentModule: any = new Object();
          newStudentModule.emailId = emailId;
          newStudentModule.courseId = courseId;
          newStudentModule.modules = templateModules;

          const StudentModuleModelCreate = new DataModel<StudentModule>(
            DB_COLLECTIONS.STUDENT_MODULE_MODULE,
            DB_CONSTANTS.CREATE_ACTION
          );

          StudentModuleModelCreate.setDocToUpdate(newStudentModule);
          return StudentModuleModelCreate.exec().then((doc) => {
            return doc.save().then(() => {
              res.status(201).json({ message: "Created modules for student!" });
              return doc;
            });
          });
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0001] Something went wrong" });
      Log.error(error, `Error: ${SS0001}`);
    });
});

// @desc      Get module dashboard student module
// @route     POST /student/getModulesDashboard
// @access    Private
export const getModuleDashboard = asyncWrapper((req: any, res: any) => {
  const { courseId, emailId } = req.body;

  return sectionByCourseId(courseId)
    .then((section) => {
      const dashboardObject: any = new Object();

      section.sections.map((sect: any) => {
        const tempObj: any = new Object();
        tempObj.sectionName = sect.name;
        tempObj.modules = [];

        dashboardObject[sect.sectionId] = tempObj;
      });

      const objTemplateQuery: any = new Object();
      objTemplateQuery.courseId = courseId;
      objTemplateQuery.emailId = emailId;
      const TemplateModuleModelFind = new DataModel<ModuleTemplate>(
        DB_COLLECTIONS.MODULE_TEMPLATE_MODEL,
        DB_CONSTANTS.SEARCH_ACTION,
        DB_CONSTANTS.FIND_ONE,
        objTemplateQuery
      );

      const objStudentQuery: any = new Object();
      objStudentQuery.courseId = courseId;
      objStudentQuery.emailId = emailId;
      const StudentModuleModelFind = new DataModel<StudentModule>(
        DB_COLLECTIONS.STUDENT_MODULE_MODULE,
        DB_CONSTANTS.SEARCH_ACTION,
        DB_CONSTANTS.FIND_ONE,
        objStudentQuery
      );

      return TemplateModuleModelFind.exec().then((moduleTemplate) => {
        return StudentModuleModelFind.exec().then((studentModule) => {
          Object.keys(moduleTemplate.modules).forEach((key) => {
            const tempObj: any = { ...moduleTemplate.modules[key] };
            tempObj.studentScore = studentModule.modules[key].studentScore;

            dashboardObject[moduleTemplate.modules[key].sectionId].modules.push(
              tempObj
            );
          });

          res.status(201).json(dashboardObject);
          return dashboardObject;
        });
      });
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0001] Something went wrong" });
      Log.error(error, `Error: ${SS0001}`);
    });
});
