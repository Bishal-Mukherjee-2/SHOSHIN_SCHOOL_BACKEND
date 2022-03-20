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
import { updateTemplateModule } from "./admin.moduletemplate.controller";

// @desc      Create Module
// @route     POST /admin/createModule
// @access    Private

export const createModule = asyncWrapper((req, res) => {
  const module = req.body;
  const { sequenceId, courseId } = req.body;

  const objQuery: any = new Object();

  objQuery.courseId = courseId;
  objQuery.sequenceId = sequenceId;

  const ModuleModelFind = new DataModel<Module>(
    DB_COLLECTIONS.MODULE_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    objQuery
  );

  return ModuleModelFind.exec()
    .then((exist): Promise<any> => {
      if (exist) {
        res.status(201).json({
          message: `Module already exists!`,
        });
        return Promise.resolve({});
      } else {
        const ModuleModel = new DataModel<Module>(
          DB_COLLECTIONS.MODULE_MODEL,
          DB_CONSTANTS.CREATE_ACTION
        );
        ModuleModel.setDocToUpdate(module);
        return ModuleModel.exec().then((doc) => {
          return doc.save().then(() => {
            return updateTemplateModule(doc._id.toString(), module, false).then(
              () => {
                res.status(201).json({
                  message: `Module created successfully!`,
                });
                return doc;
              }
            );
          });
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0001] Something went wrong" });
      Log.error(error, `Error: ${SS0001}`);
    });
});

// @desc      Edit Module
// @route     POST /admin/editModule
// @access    Private

export const editModule = asyncWrapper((req, res) => {
  const module = req.body;
  const { sequenceId, courseId } = req.body;

  const objQuery: any = new Object();

  objQuery.courseId = courseId;
  objQuery.sequenceId = sequenceId;

  const ModuleModelFind = new DataModel<Module>(
    DB_COLLECTIONS.MODULE_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    objQuery
  );

  return ModuleModelFind.exec()
    .then((exist): Promise<any> => {
      if (!exist) {
        res.status(201).json({
          message: `Module doesn't exists! to edit`,
        });
        return Promise.resolve({});
      } else {
        const ModuleModel = new DataModel<Module>(
          DB_COLLECTIONS.MODULE_MODEL,
          DB_CONSTANTS.UPDATE_ACTION,
          DB_CONSTANTS.FIND_ONE_UPDATE,
          objQuery
        );
        ModuleModel.setDocToUpdate({ $set: module });

        return ModuleModel.exec().then((doc) => {
          return doc.save().then(() => {
            return updateTemplateModule(doc._id.toString(), module, true).then(
              () => {
                res.status(201).json({
                  message: `Module updated successfully!`,
                });
                return doc;
              }
            );
          });
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0001] Something went wrong" });
      Log.error(error, `Error: ${SS0001}`);
    });
});

// @desc      Get all Modules
// @route     GET /admin/getAllModules
// @access    Private
export const getAllModules = asyncWrapper((req, res) => {
  const ModuleModelFind = new DataModel<Module>(
    DB_COLLECTIONS.MODULE_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND,
    {}
  );
  return ModuleModelFind.exec()
    .then((modules): Promise<any> => {
      if (!modules) {
        res.status(201).json({
          message: `No modules found`,
        });
      } else {
        res.status(200).json({ modules });
      }
      return Promise.resolve({});
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0001] Something went wrong" });
      Log.error(error, `Error: ${SS0001}`);
    });
});

// @desc      Get modules by courseId
// @route     POST /admin/getModuleByCourseId
// @access    Private
export const getModuleByCourseId = asyncWrapper((req, res) => {
  const { courseId } = req.body;
  const objQuery: any = new Object();
  objQuery.courseId = courseId;

  const ModuleModelFind = new DataModel<Module>(
    DB_COLLECTIONS.MODULE_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND,
    objQuery
  );

  return ModuleModelFind.exec()
    .then((module): Promise<any> => {
      if (!module) {
        res.status(201).json({
          message: `No module with this Course Id`,
        });
      } else {
        res.status(200).json(module);
      }
      return Promise.resolve({});
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0001] Something went wrong" });
      Log.error(error, `Error: ${SS0001}`);
    });
});


