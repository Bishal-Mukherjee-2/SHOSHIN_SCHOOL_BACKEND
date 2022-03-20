const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const smap = {
  1: "prospectsPage",
  2: "codejudge",
};

const question =
  "Which page" +
  Object.keys(smap).reduce((result, val) => {
    result += `\n ${val}. ${smap[val]}`;
    return result;
  }, "") +
  " ?";

rl.question(question, function (page) {
  const CMD = getCmd(page);
  console.log("\n\n Run this: \n\n", CMD, "\n\n");
  rl.question("Run above CMD here [1 or 0] ? ", function (childProcess) {
    if (childProcess === "1") {
      console.log("\n\n Runing... \n\n");
      triggerChild(CMD);
    } else {
      rl.close();
    }
  });
});

rl.on("close", function () {
  process.exit(0);
});

function getCmd(page) {
  const pageName = smap[page];
  if (pageName) {
    let CMD = `artillery run -c tests/artillery/config.yaml -o tests/artillery/reports/${pageName}.json tests/artillery/scenarios/${pageName}.yaml`;
    CMD += ` && artillery report -o tests/artillery/reports/${pageName}.html tests/artillery/reports/${pageName}.json`;

    // ADD more
    //CMD += ` && YOUR_CMD`

    return CMD;
  }
  return false;
}

function triggerChild(CMD) {
  const { exec } = require("child_process");
  if (CMD) {
    exec(CMD, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(stdout);
      process.exit(0);
    });
  }
}
