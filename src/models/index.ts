export default async function register() {
  await import("./course.model");
  await import("./modulesection.model");
  await import("./module.model");
  await import("./doubt.model");
  await import("./moduletemplate.model");
  await import("./studentmodule.model");
  await import("./studentprofile.model");
  await import("./codeExecution.model");
  await import("./testcases.model");
  await import("./notifications.model");
}
