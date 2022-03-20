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
import { Module } from "../../models/module.model";
import { ModuleSection, Section } from "../../models/modulesection.model";
import { ModuleTemplate } from "../../models/moduletemplate.model";

import DataModel, { QueryType } from "../../helpers/DataModel";
import { DB_COLLECTIONS, DB_CONSTANTS } from "../../constants";
import { mongoose } from "@typegoose/typegoose";

export const updateTemplateModule = (
  id: string,
  module: Module,
  editing: boolean
) => {
  const objQuery: any = new Object();
  objQuery.courseId = module.courseId;

  const ModuleTemplateModelFind = new DataModel<ModuleTemplate>(
    DB_COLLECTIONS.MODULE_TEMPLATE_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    objQuery
  );

  return ModuleTemplateModelFind.exec()
    .then((exist): Promise<any> => {
      if (exist) {
        const UpdateModuleTemplateModel = new DataModel<ModuleTemplate>(
          DB_COLLECTIONS.MODULE_TEMPLATE_MODEL,
          DB_CONSTANTS.UPDATE_ACTION,
          DB_CONSTANTS.FIND_ONE_UPDATE,
          { courseId: module.courseId }
        );

        const newObj: any = new Object();
        newObj.modules = exist.modules;

        if (editing) {
          const newModule: any = { ...module };
          newModule.lesson = exist.modules[id] && exist.modules[id].lesson;

          newObj.modules[id] = newModule;
        } else {
          newObj.modules[id] = module;
        }

        UpdateModuleTemplateModel.setDocToUpdate({ $set: newObj });

        return UpdateModuleTemplateModel.exec();
      } else {
        const obj: any = new Object();

        obj.courseId = module.courseId;
        obj.modules = {};
        obj.modules[id] = module;

        const ModuleTemplateModel = new DataModel<ModuleTemplate>(
          DB_COLLECTIONS.MODULE_TEMPLATE_MODEL,
          DB_CONSTANTS.CREATE_ACTION
        );
        ModuleTemplateModel.setDocToUpdate(obj);
        return ModuleTemplateModel.exec().then((doc) => {
          return doc.save().then(() => {
            return doc;
          });
        });
      }
    })
    .catch((error) => {
      Log.error(error, `Error: ${SS0001}`);
    });
};

export const templateByCourseId = (courseId: string) => {
  const objQuery: any = new Object();

  objQuery.courseId = courseId;

  const ModuleTemplateModel = new DataModel<ModuleTemplate>(
    DB_COLLECTIONS.MODULE_TEMPLATE_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    objQuery
  );

  return ModuleTemplateModel.exec().then((result): Promise<any> => {
    if (result) {
      return Promise.resolve(result);
    } else {
      return Promise.resolve();
    }
  });
};

// @desc      Get template module by courseId
// @route     POST /admin/getModuleTemplateByCourseId
// @access    Private

export const getModuleTemplateByCourseId = asyncWrapper((req, res) => {
  const { courseId } = req.body;

  return templateByCourseId(courseId)
    .then((template): Promise<any> => {
      if (template) {
        res.status(201).json(template);
        return Promise.resolve();
      } else {
        res.status(201).json({
          message: `Template does not exist with the courseID ${courseId}`,
        });
        return Promise.resolve({});
      }
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0003] Something went wrong" });
      Log.error(error, `Error: ${SS0003}`);
    });
});
