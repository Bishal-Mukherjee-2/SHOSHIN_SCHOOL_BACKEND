const fs = require("fs");

const exec = (command, cwd = ".") =>
  require("child_process").execSync(command, { cwd, stdio: "inherit" });

const moveFiles = () => {
  const moveToClient = (path) => exec(`mv ${path} react_client`);

  console.log("Moving files to react_client");

  moveToClient("tmp/build/static");
  moveToClient("tmp/build/asset-manifest.json");
  moveToClient("tmp/build/index.html");
  //   moveToClient("tmp/build/logo.png");
  moveToClient("tmp/.env.*");
  if (fs.existsSync("./tmp/.profile")) {
    exec(`mv tmp/.profile .`);
  }
};

function buildReactClient() {
  try {
    if (!process.env.BUILD_CLIENT) {
      return;
    }

    let clientBranch = process.env.REACT_CLIENT_BRANCH;

    exec("rm -rf react_client");
    if (!clientBranch) {
      clientBranch = "master";
    }

    console.log(`[Client v2] Cloning branch ${clientBranch}.`);

    exec(
      `git clone https://${process.env.CLIENT_GITHUB_TOKEN}@github.com/shoshinschool/Shoshin-Client-App-New.git --single-branch --branch ${clientBranch} tmp`
    );
    exec("mkdir -p react_client");

    exec("touch .env.development .env.test .env.production", "tmp");

    const ENV_FILE_CONTENT =
      "REACT_APP_APPLICATION_BASE_URL=$APPLICATION_BASE_URL";

    exec('echo "' + ENV_FILE_CONTENT + '" > .env.development', "tmp");
    exec('echo "' + ENV_FILE_CONTENT + '" > .env.test', "tmp");
    exec('echo "' + ENV_FILE_CONTENT + '" > .env.production', "tmp");

    exec("npm install", "tmp");
	console.log("_______________npm install completed_________________")
    exec("npm run build", "tmp");
    // exec("npm run build-upload", "tmp");

    moveFiles();

    exec("rm -rf tmp");
    console.log("[Client v2] Client build completed");
  } catch (err) {
    console.log(`[Client v2] ${err}`);
    console.log("[Client v2] Client build failed");
  }
}

buildReactClient();
