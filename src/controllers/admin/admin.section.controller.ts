import asyncWrapper from "../../utilities/async-wrapper";
import AdminModule from "../../models/admin/module";
import {
  SS0011,
  SS0012,
  SS0013,
  SS0014,
  SS0015,
  SS0016,
} from "../../errors/errorCodes";
import { Log } from "../../utilities/debug";

import { ModuleSection, Section } from "../../models/modulesection.model";

import DataModel from "../../helpers/DataModel";
import { DB_COLLECTIONS, DB_CONSTANTS } from "../../constants";

// @desc      Create new section
// @route     POST /admin/createNewSection
// @access    Private
export const createNewSection = asyncWrapper((req, res) => {
  const { courseId, sectionId, sectionName } = req.body;

  const ModuleSectionModel = new DataModel<ModuleSection>(
    DB_COLLECTIONS.MODULE_SECTION_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    { courseId: courseId }
  );

  return ModuleSectionModel.exec()
    .then((result): Promise<any> => {
      if (result) {
        const UpdateModuleSectionModel = new DataModel<ModuleSection>(
          DB_COLLECTIONS.MODULE_SECTION_MODEL,
          DB_CONSTANTS.UPDATE_ACTION,
          DB_CONSTANTS.FIND_ONE_UPDATE,
          { courseId: courseId }
        );

        const newDoc: ModuleSection = new Object();
        newDoc.sections = result.sections;
        newDoc.sections &&
          newDoc.sections.push({
            sectionId: sectionId,
            name: sectionName,
          });

        UpdateModuleSectionModel.setDocToUpdate({ $set: newDoc });

        return UpdateModuleSectionModel.exec().then((result) => {
          res.status(201).json({
            message: `Section added successfully!`,
          });
          return Promise.resolve({});
        });
      } else {
        const NewModuleSectionModel = new DataModel(
          DB_COLLECTIONS.MODULE_SECTION_MODEL,
          DB_CONSTANTS.CREATE_ACTION
        );

        const newDoc: ModuleSection = new Object();
        newDoc.courseId = courseId;
        newDoc.sections = [];
        newDoc.sections.push({
          sectionId: sectionId,
          name: sectionName,
        });

        NewModuleSectionModel.setDocToUpdate(newDoc);
        return NewModuleSectionModel.exec().then((doc) => {
          doc.save().then(() => {
            res.status(201).json({
              message: `Section added successfully!`,
            });
            return Promise.resolve({});
          });
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0011 Something went wrong" });
      Log.error(error, `Error: ${SS0011}`);
    });
});

export const sectionByCourseId = (courseId: string) => {
  const ModuleSectionModel = new DataModel<ModuleSection>(
    DB_COLLECTIONS.MODULE_SECTION_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    { courseId: courseId }
  );

  return ModuleSectionModel.exec();
};

// @desc      Get all sections by courseId
// @route     POST /admin/getSectionByCourseId
// @access    Private
export const getSectionByCourseId = asyncWrapper((req, res) => {
  const { courseId } = req.body;

  return sectionByCourseId(courseId)
    .then((sections): Promise<any> => {
      res.status(200).json(sections);
      return Promise.resolve({});
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0012 Something went wrong" });
      Log.error(error, `Error: ${SS0012}`);
    });
});
