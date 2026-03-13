const fs = require("fs");
const path = require("path");
const {exec} = require("child_process");
const unzip = require("unzip");
const express = require("express");
const data = require("../data");
const config = require("../config");
const {findWads, findWad} = require("./findWads");
const analyzeWad = require("./analyzeWad");
const downloadWad = require("./downloadWad");
const {getWadOrPk3Files} = require("./getWadFiles");
const {isWad} = require("./isWad");

// Express app
const app = express();
app.use(express.json());
app.use(express.static("public"));

// Get actual names of files referenced in data.json,
// and mark unavailable games/episodes as such
const files = getWadOrPk3Files(config.wadDir);

const knownWads = data.games.reduce((wads, game) => {
  findWads(wads, game, files);

  if (Array.isArray(game.episodes)) {
    game.episodes.forEach(episode => {
      findWads(wads, episode, files);
    });

    // Disable game if all episodes are unavailable
    if (game.episodes.every(episode => episode.disabled)) {
      game.disabled = true;
    }
  }

  return wads;
}, {});

// Hide ID24-esque resource WADs since capable source ports autoload those anyway
findWad(knownWads, "id24res.wad", files);
findWad(knownWads, "extras.wad", files);

const foundWads = Object.values(knownWads).filter(Boolean);

// Expose all JSON (internal and user)
app.get("/config", async (req, res) => {
  // (Re)read user config
  const currentConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "config.json")));

  // Build list of available files in the user's WAD directory,
  // and detect complevels for actual .wad files
  const availableWads = await getWadOrPk3Files(config.wadDir).reduce(async (wads, file) => {
    if (!foundWads.includes(file)) {
      const wad = {file};

      if (isWad(file)) {
        const results = await analyzeWad(path.resolve(config.wadDir, file));
        Object.keys(results).forEach(key => wad[key] = results[key]);
      }

      (await wads).push(wad);
    }

    return wads;
  }, []);

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({...data, ...currentConfig, knownWads: foundWads, availableWads}));
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
