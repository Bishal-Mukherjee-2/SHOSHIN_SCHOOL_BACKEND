export const AWS_ADMIN_BUCKET = "admin-lessions-attachments";

export const QUEUES = {
  CODE_EXECUTION: "CODE_EXECUTION",
  TEST: "TEST",
};

export const DB_COLLECTIONS = {
  //   USER_MODEL: "userdetails",
  PROSPECT_MODEL: "prospectdetails",
  COURSE_MODEL: "coursedetails",
  MODULE_SECTION_MODEL: "modulesectiondetails",
  MODULE_TEMPLATE_MODEL: "moduletemplatedetails",
  MODULE_MODEL: "moduledetails",
  DOUBT_MODEL: "doubtdetails",
  STUDENT_MODULE_MODULE: "studentmoduledetails",
  USER_DETAILS_MODULE: "userdetails",
  CODE_EXECUTION_MODEL: "codeexecutiondetails",
  TEST_CASES_MODEL: "testcasesdetails",
  NOTIFICATION_MODEL: "notificationsdetails",
};

export const DB_CONSTANTS = {
  SEARCH_ACTION: "search",
  UPDATE_ACTION: "update",
  DELETE_ACTION: "delete",
  CREATE_ACTION: "create",
  AGGREGATE_ACTION: "aggregate",
  DISTINCT: "distinct",

  FIND: "find",
  FIND_ONE: "findone",
  COUNT: "count",

  UPDATE_ALL: "updateall",
  FIND_ONE_UPDATE: "findoneandupdate",
  FIND_BY_ID_UPDATE: "findbyidupdate",
};

export let MODEL_LOWER_CASE_FIELDS_MAP: { [index: string]: string[] } = {};
MODEL_LOWER_CASE_FIELDS_MAP["testdetails"] = ["email"]; // For test suites
// MODEL_LOWER_CASE_FIELDS_MAP[DB_COLLECTIONS.USER_MODEL] = [
//   "username",
//   "emailID",
// ];
MODEL_LOWER_CASE_FIELDS_MAP[DB_COLLECTIONS.PROSPECT_MODEL] = [
  "pEmail",
  "prospectOwner",
  "crmOwnerEmail",
];
