/* istanbul ignore file */
import { Types } from "mongoose";
import { AggregationList } from "./DataModel";

export default class Aggregate {
  private query: AggregationList;

  constructor(initMatch: { [index: string]: any }) {
    this.match(initMatch);
  }

  getQuery(): AggregationList {
    return this.query;
  }

  match(query: any): void {
    if (this.query) {
      this.query.push({ $match: query });
    } else {
      this.query = [{ $match: query }];
    }
  }

  group(query: any): void {
    this.query.push({ $group: query });
  }

  count(query: any): void {
    this.query.push({ $count: query });
  }

  groupAndGetFirst(
    groupRef: Types.ObjectId,
    fields: string[],
    extraAccumulators: string[]
  ): void {
    const query: any = new Object();
    query._id = groupRef;

    fields.forEach(function (field) {
      query[field] = { $first: "$" + field };
    });

    if (extraAccumulators) {
      Object.keys(extraAccumulators).forEach(function (field: any) {
        query[field] = extraAccumulators[field];
      });
    }
    this.query.push({ $group: query });
  }

  project(query: any): void {
    this.query.push({ $project: query });
  }

  projectAsIt(fields: string[], query: any): void {
    const projectQuery: any = new Object();

    fields.forEach(function (field) {
      projectQuery[field] = 1;
    });

    if (query) {
      Object.keys(query).forEach(function (field: any) {
        projectQuery[field] = query[field];
      });
    }

    this.query.push({ $project: projectQuery });
  }

  lookup(
    foreignModel: string,
    localField: string,
    foreignField: string,
    newField: string
  ): void {
    this.query.push({
      $lookup: {
        from: foreignModel,
        localField: localField,
        foreignField: foreignField,
        as: newField,
      },
    });
  }

  sort(query: any): void {
    this.query.push({ $sort: query });
  }

  unwind(field: string): void {
    this.query.push({
      $unwind: { path: "$" + field, preserveNullAndEmptyArrays: true },
    });
  }

  limit(limit: number): void {
    this.query.push({ $limit: limit });
  }

  skip(skip: number): void {
    this.query.push({ $skip: skip });
  }

  paginate(limit: number, page: number): void {
    const skip = (page - 1) * limit;
    this.query.push({ $limit: skip + limit });
    this.query.push({ $skip: skip });
  }

  writeToCollection(collection: string): void {
    this.query.push({ $out: collection });
  }

  addFields(field: string): void {
    this.query.push({ $addFields: field });
  }

  projectAfterGroup(projectFields: string[], unwindField: string): void {
    const objProjectFields: any = new Object();
    projectFields.forEach(function (field) {
      objProjectFields[field] = "$" + unwindField + "." + field;
    });

    this.query.push({ $project: objProjectFields });
  }

  replaceRoot(newRootField: string): void {
    this.query.push({ $replaceRoot: { newRoot: "$" + newRootField } });
  }

  redact(
    ifExpression: any,
    thenExpression: "$$DESCEND" | "$$PRUNE" | "$$KEEP",
    elseExpression: "$$DESCEND" | "$$PRUNE" | "$$KEEP"
  ): void {
    this.query.push({
      $redact: {
        $cond: {
          if: ifExpression,
          then: thenExpression,
          else: elseExpression,
        },
      },
    });
  }
}
