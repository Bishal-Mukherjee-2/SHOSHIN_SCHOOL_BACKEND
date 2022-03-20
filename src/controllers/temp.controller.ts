import asyncWrapper from "../utilities/async-wrapper";
import { AuthenticationError, ValidationError, NotFoundError } from "../errors";
import { Log } from "../utilities/debug";
import { SS0001, SS0002, SS0003, SS0004, SS0005 } from "../errors/errorCodes";
import EventEmitterHelper from "../helpers/EventEmitter";

export const tempFun = asyncWrapper((req, res): Promise<any> => {
  return Promise.resolve({});
});
