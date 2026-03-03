const fs = require("fs");
const {exec} = require("child_process");
const unzip = require("unzip");
const express = require("express");
const data = require("../data");
const config = require("../config");
const addWads = require("./addWads");
const downloadWad = require("./downloadWad");
const isWad = require("./isWad");

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
}, ["id24res.wad"]); // hidden because UZDoom autoloads it, Crispy Doom can't run it and I have a dedicated Woof! profile for it

// Expose all JSON
app.get("/config", (req, res) => {
  // Build list of available files in the user's WAD directory
  const availableWads = fs.readdirSync(config.wadDir).reduce((wads, file) => {
    if (isWad(file) && !knownWads.includes(file)) {
      wads.push(file);
    }

    return wads;
  }, []);

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({...data, ...config, availableWads}));
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
