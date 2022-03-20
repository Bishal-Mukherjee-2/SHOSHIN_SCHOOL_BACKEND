import mongoose, { Document, Model, Types } from "mongoose";

import { DB_CONSTANTS, MODEL_LOWER_CASE_FIELDS_MAP } from "../constants";

mongoose.Promise = Promise;

const SEARCH_QUERY_MAX_TIME_MS = 100000;

function lowerCaseFields(strModel: string, objDoc: any, action: string): void {
  const modelFieldList = MODEL_LOWER_CASE_FIELDS_MAP[strModel];
  if (!modelFieldList || modelFieldList.length === 0) {
    return;
  }
  const doc = JSON.stringify(objDoc);
  modelFieldList.forEach(function (lowerCaseField: string) {
    if (doc && doc.indexOf(lowerCaseField) !== -1) {
      if (action === DB_CONSTANTS.CREATE_ACTION && objDoc[lowerCaseField]) {
        objDoc[lowerCaseField] = objDoc[lowerCaseField].toLowerCase();
      }
    }
  });
}

function addHistoryFieldsToUpdateDoc(user: string, doc: any): void {
  const date = Date.now();
  if (doc.$set !== undefined) {
    doc.$set["lastUpdatedDate"] = date;
    doc.$set["lastUpdatedBy"] = user;
  } else {
    doc["$set"] = {};
    doc["$set"]["lastUpdatedDate"] = date;
    doc["$set"]["lastUpdatedBy"] = user;
  }
}

/**
 * Use `new DataModel<Type>()` for that intellisense goodness.
 */
export type QueryType<Q> = {
  [P in keyof Q]: Q[P];
} & { $and: Q[]; $or: Q[]; flgUseStatus: number } & Document &
  any;

export type AggregationList = {
  [index: number]: any;
  0: { $match: { [index: string]: any } };
} & Array<any>;

export default class DataModel<T> {
  private doc?: Document;
  private modelName: string;
  private action: string;
  private subAction: string;
  private username: string;
  private query: QueryType<T>;
  private update: any;
  private subDocToUpdate: any;
  private selectedFieldList: string;
  private aggregationList: AggregationList;
  private skip: number;
  private diskUse: boolean;
  private upsert: boolean;
  private distinctField: string;
  private sort: object;
  private limit: number;

  constructor(
    name: string,
    actionToPerform: string,
    subActionToPerform?: string,
    query?: T,
    selectListStr?: string | undefined,
    subDoc?: object
  ) {
    this.modelName = name;
    this.action = actionToPerform;
    if (subActionToPerform) this.subAction = subActionToPerform;
    if (query) this.setCondition(query);
    if (selectListStr) this.selectedFieldList = selectListStr;
    if (subDoc) this.subDocToUpdate = subDoc;
  }

  exec() {
    return this.performAction();
  }

  static convertStringIDListToBSONList(list: any[]) {
    return list.map((id) => new mongoose.Types.ObjectId(id.toString()));
  }

  /**
   *
   */
  private getModel(): Promise<Model<any>> {
    try {
      const model = mongoose.model(this.modelName);
      return Promise.resolve(model);
    } catch (err) {
      return Promise.reject(err.name + " : " + err.message);
    }
  }

  /**
   *
   */
  private performAction(): Promise<any> {
    switch (this.action) {
      case DB_CONSTANTS.CREATE_ACTION:
        lowerCaseFields(this.modelName, this.subDocToUpdate, this.action);
        return this.getModel().then(this.createModel.bind(this));
      case DB_CONSTANTS.UPDATE_ACTION:
        lowerCaseFields(this.modelName, this.subDocToUpdate, this.action);
        return this.getModel().then(this.doUpdate.bind(this));
      case DB_CONSTANTS.SEARCH_ACTION:
        return this.getModel().then(this.doSearch.bind(this));
      case DB_CONSTANTS.DELETE_ACTION:
        return this.getModel().then(this.deleteModel.bind(this));
      case DB_CONSTANTS.AGGREGATE_ACTION:
        return this.getModel().then(this.doAggregation.bind(this));
      default:
        return Promise.reject("This " + this.action + " is not supported");
    }
  }

  /**
   *
   * @param model
   */
  private createModel(model: Model<Document>): Promise<any> {
    return Promise.resolve(new model(this.subDocToUpdate));
  }

  /**
   *
   * @param model
   */
  private doSearch(model: any): Promise<T> {
    /**
     * Not possible to reach this next block in code
     * as query will always be set to `{ flgUseStatus: 1 }` even if
     * set to null by the developer.
     */
    /* istanbul ignore next */
    if (typeof this.query === "undefined")
      return Promise.reject(new Error("No query defined"));

    if (typeof this.subAction === "undefined" || this.subAction === "")
      this.subAction = DB_CONSTANTS.FIND;

    let mQuery: any;

    switch (this.subAction) {
      case DB_CONSTANTS.FIND:
        if (Boolean(this.limit) && (Boolean(this.skip) || this.skip === 0)) {
          if (Boolean(this.sort) && Object.keys(this.sort).length > 0)
            mQuery = model
              .find(this.query)
              .sort(this.sort)
              .skip(this.skip)
              .limit(this.limit);
          else
            mQuery = model.find(this.query).skip(this.skip).limit(this.limit);
        } else {
          if (Boolean(this.sort) && Object.keys(this.sort).length > 0)
            mQuery = model.find(this.query).sort(this.sort);
          else mQuery = model.find(this.query);
        }
        break;
      case DB_CONSTANTS.FIND_ONE:
        mQuery = model.findOne(this.query);
        break;
      case DB_CONSTANTS.DISTINCT:
        mQuery = model.distinct(this.distinctField, this.query);
        break;
      case DB_CONSTANTS.COUNT:
        mQuery = model.countDocuments(this.query);
        break;
      default:
        return Promise.reject(new Error("Invalid subAction " + this.subAction));
    }

    if (
      typeof this.selectedFieldList !== "undefined" &&
      this.selectedFieldList !== ""
    ) {
      mQuery.select(this.selectedFieldList);
    }

    return new Promise((resolve, reject) => {
      mQuery
        .maxTimeMS(SEARCH_QUERY_MAX_TIME_MS)
        .exec((err: any, result: any) => {
          /* istanbul ignore if */
          if (err) return reject(err);
          else return resolve(result);
        });
    });
  }

  /**
   *
   * @param Model
   */
  private doUpdate(Model: Model<Document>): Promise<any> {
    if (typeof this.subAction === "undefined" || this.subAction === "")
      this.subAction = DB_CONSTANTS.FIND_ONE_UPDATE;

    if (typeof this.subDocToUpdate === "undefined") {
      this.subDocToUpdate = {};
    }

    const objUpsert: any = new Object();
    if (this.upsert) {
      objUpsert.upsert = true;
    } else {
      objUpsert.upsert = false;
    }

    addHistoryFieldsToUpdateDoc(this.username, this.subDocToUpdate);

    switch (this.subAction) {
      case DB_CONSTANTS.FIND_ONE_UPDATE:
        if (objUpsert && objUpsert.upsert) {
          this.subDocToUpdate["$setOnInsert"] = {
            createdBy: this.username,
          };
        }
        return new Promise((resolve, reject) => {
          Model.findOneAndUpdate(
            this.query,
            this.subDocToUpdate,
            Object.assign({ new: true, setDefaultsOnInsert: true }, objUpsert),
            (err, doc) => {
              if (err) {
                reject(err);
              } else {
                resolve(doc);
              }
            }
          );
        });

      case DB_CONSTANTS.UPDATE_ALL:
        return new Promise((resolve, reject) => {
          Model.updateMany(
            this.query,
            this.subDocToUpdate,
            objUpsert,
            (err, doc) => {
              if (err) {
                reject(err);
              } else {
                resolve(doc);
              }
            }
          );
        });

      case DB_CONSTANTS.FIND_BY_ID_UPDATE:
        if (this.query == undefined || this.query.id == undefined)
          return Promise.reject(
            new Error("id field is not configured in condition")
          );

        return new Promise((resolve, reject) => {
          Model.findByIdAndUpdate(
            this.query.id,
            this.subDocToUpdate,
            objUpsert,
            (err, result) => {
              if (err) {
                return reject(err);
              } else if (err == null && result == null) {
                return reject("Invalid Id");
              } else {
                return resolve(result);
              }
            }
          );
        });

      default:
        return Promise.reject(new Error("Invalid subAction " + this.subAction));
    }
  }

  /**
   *
   * @param model
   */
  private deleteModel(model: Model<Document>): Promise<T> {
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const inThirtyDays = new Date(new Date().valueOf() + thirtyDaysInMs);

    this.subDocToUpdate = {
      flgUseStatus: 0,
      hardDeleteTime: inThirtyDays,
    };

    return this.doUpdate(model);
  }

  private doAggregation(Model: Model<Document>): Promise<any> {
    return new Promise((resolve, reject) => {
      const aggregation: any = Model.aggregate(this.aggregationList as any[]);
      if (this.diskUse) {
        aggregation.options = { allowDiskUse: true };
      }

      aggregation.exec(function (err: any, result: any) {
        /* istanbul ignore if */
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  setCondition(
    conditionObj: T,
    searchDeletedRecordsAlso: boolean = false
  ): void {
    this.query = <QueryType<T>>Object.assign({}, conditionObj);

    if (!searchDeletedRecordsAlso) {
      if (this.query.$or) {
        this.query.$or = this.query.$or.map(function (subQuery: any) {
          subQuery.flgUseStatus = 1;
          return subQuery;
        });
        return;
      }
      if (this.query.$and) {
        this.query.$and = this.query.$and.map(function (subQuery: any) {
          subQuery.flgUseStatus = 1;
          return subQuery;
        });
        return;
      }
      this.query.flgUseStatus = 1;
      return;
    }
    return;
  }

  setDocToUpdate(docToUpdate: any): void {
    this.subDocToUpdate = docToUpdate;
  }

  allowDiskUse(): void {
    this.diskUse = true;
  }

  setUpsert(): void {
    this.upsert = true;
  }

  setSelectFieldString(str: string): void {
    this.selectedFieldList = str;
  }

  setSubAction(subAction: any): void {
    this.subAction = subAction;
  }

  setDistinctField(field: string): void {
    this.distinctField = field;
  }

  save(doc: any): Promise<Document | Error> {
    return new Promise((resolve, reject) => {
      if (typeof this.username === "undefined") {
        return reject(new Error("No username is set."));
      }

      doc.lastUpdatedDate = Date.now();
      doc.lastUpdatedBy = this.username;

      doc.save(function (err: Error, result: any) {
        /* istanbul ignore if */
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  setAggregationList(aggregationList: AggregationList): void {
    if (aggregationList && aggregationList[0].$match) {
      const tempQuery = Object.assign({}, aggregationList[0].$match);
      if (tempQuery["$or"] && tempQuery["$or"].length) {
        tempQuery["$or"].forEach(function (objCondtion: any) {
          objCondtion.flgUseStatus = 1;
        });
      } else {
        tempQuery.flgUseStatus = 1;
      }
      tempQuery.flgUseStatus = 1;

      aggregationList[0].$match = tempQuery;
      this.aggregationList = aggregationList;
      return;
    }

    const enhancedAggregationList: AggregationList = [
      { $match: { flgUseStatus: 1 } },
    ];
    this.aggregationList = enhancedAggregationList.concat(
      aggregationList
    ) as AggregationList;
  }

  setUser(username: string): void {
    this.username = username;
  }
  setPagination(limit: number, page: number): void {
    const skip = (page - 1) * limit;
    this.limit = limit;
    this.skip = skip;
  }
  setSort(order: any): void {
    this.sort = order;
  }
  setLimit(limit: number): void {
    this.limit = limit;
  }
  setSkip(skip: number): void {
    this.skip = skip;
  }
  getModelName(): string {
    return this.modelName;
  }
  getAction(): string {
    return this.action;
  }
  getQuery() {
    return this.query;
  }
  getUpdateDoc() {
    return this.subDocToUpdate;
  }
}

export type DModel = DataModel<any>;
