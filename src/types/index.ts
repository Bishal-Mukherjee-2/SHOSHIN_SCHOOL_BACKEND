import { RequestHandler } from "express";
import Bluebird from "bluebird";

export type FunctionChangedReturn<TFn, TR> = TFn extends (...a: infer A) => any
  ? (...a: A) => TR
  : never;

export type CustomRequestHandler = FunctionChangedReturn<
  RequestHandler,
  Promise<void> | void | Bluebird<any>
>;
