const fs = require("fs");
const path = require("path");
const {exec} = require("child_process");
const unzip = require("unzip");
const express = require("express");
const data = require("../data");
const config = require("../config");
const addWads = require("./addWads");
const detectCompLevel = require("./detectCompLevel");
const downloadWad = require("./downloadWad");
const {isWad, isWadOrPk3} = require("./isWad");

// Express app
const app = express();
app.use(express.json());
app.use(express.static("public"));

// Build exclude list out of WAD files referenced in data.json
const knownWads = data.games.reduce((wads, game) => {
  addWads(wads, game);

  (game.episodes || []).forEach(episode => {
    addWads(wads, episode);
  });

  return wads;
}, ["id24res.wad", "extras.wad"]); // hide ID24-esque resource WADs since capable source ports autoload those anyway

// Expose all JSON (internal and user)
app.get("/config", async (req, res) => {
  // (Re)read user config
  const currentConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "config.json")));

  // Build list of available files in the user's WAD directory,
  // and detect complevels for actual .wad files
  const availableWads = await fs.readdirSync(currentConfig.wadDir).reduce(async (wads, file) => {
    if (isWadOrPk3(file) && !knownWads.includes(file)) {
      const wad = {file};

      if (isWad(file)) {
        wad.compLevel = await detectCompLevel(path.resolve(currentConfig.wadDir, file));
      }

      (await wads).push(wad);
    }

    return wads;
  }, []);

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({...data, ...currentConfig, availableWads}));
});

// Run command line
app.post("/run", (req, res) => {
  const execPath = req.body.commandLine.split(" ")[0]; // this will break if a port has a space in its path
  const portPaths = Object.values(config.ports).reduce((paths, port) => [...paths, port.path, ...(port.setupPath ? [port.setupPath] : [])], []);

  // Check we are actually running one of our source ports (or setup utilities)
  if (portPaths.some(portPath => portPath === execPath)) {
    exec(req.body.commandLine, () => res.end());
  } else {
    res.end();
  }
});

// Download from /idgames
app.post("/download", async (req, res) => {
  await downloadWad(req.body.url.replace("doomworld.com", "quaddicted.com/files") + ".zip", config.wadDir);
  res.end();
});

// Delete file
app.get("/delete", (req, res) => {
  fs.rmSync(`${config.wadDir}/${req.query.file}`, {force: true});
  res.end();
});

app.listen(config.httpPort, () => {
  console.log(`Vincent is running: http://localhost:${config.httpPort}`);
});
