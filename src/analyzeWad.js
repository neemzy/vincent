const fs = require("fs");
const path = require("path");
const {Readable} = require("stream");
const FileReader = require("filereader");
const data = require("../data");
const flagsToBits = require("./flagsToBits");

// Complevel priority table
const priorities = data.compLevels.reduce((acc, compLevel, index) => {
  acc[compLevel.key] = index;
  return acc;
}, {});

// Compatibility tables from JSON (internal) config
const lineTypes = buildCompTable("lineTypes");
const lineFlags = buildCompTable("lineFlags");
const sectorTypes = buildCompTable("sectorTypes");
const thingTypes = buildCompTable("thingTypes");
const thingFlags = buildCompTable("thingFlags");

// No JS modules? No problem
const jsFiles = [
  ["wad", "constants.js"],
  ["wad", "mapdata.js"],
  ["wad", "playpal.js"],
  ["wad", "util.js"],
  ["wad.js"],
  ["wad", "detectlump.js"]
].map(filePath => fs.readFileSync(path.resolve(__dirname, "..", "node_modules", "wad-js", "src", ...filePath), {encoding: "utf-8"}));

// Must eval() at the root scope to get access to Wad and MapData variables
eval(jsFiles[0]);
eval(jsFiles[1]);
eval(jsFiles[2]);
eval(jsFiles[3]);
eval(jsFiles[4]);
eval(jsFiles[5]);

async function analyzeWad(wadFile) {
  const wadObj = Object.create(Wad);

  try {
    await loadWadAsPromise(wadFile, wadObj);
  } catch (error) {
    console.error(error);
  }

  // Detect first map number (and episode if ExMy format)
  const mapNames = getMapNames(wadObj);
  const firstMap = {episode: 0, map: 0};
  const matchExMy = mapNames[0].match(/^E(\d)M(\d)/);

  if (matchExMy) {
    firstMap.episode = parseInt(matchExMy[1]);
    firstMap.map = parseInt(matchExMy[2]);
  } else {
    firstMap.map = parseInt(mapNames[0].match(/(\d+)/)[1]);
  }

  // TODO: actually check all maps
  const mapDataObj = Object.create(MapData);
  mapDataObj.load(wadObj, mapNames[0]);

  return {
    compLevel: detectCompLevel(mapDataObj),
    firstMap
  };
}

module.exports = analyzeWad;

function loadWadAsPromise(wadFile, wadObj) {
  return new Promise((resolve, reject) => {
    wadObj.onLoad = resolve;

    fs.readFile(wadFile, {}, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        wadObj.load({name: "osef", buffer});
      }
    });
  });
}

// Cheers StackOverflow
function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);

  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }

  return ab;
}

function buildCompTable(key) {
  return data.compLevels.reduce((types, compLevel) => {
    (compLevel[key] || []).forEach(value => Array.isArray(value)
      ? Array.from({length: value[1] - value[0] + 1}, (_, i) => types[value[0] + i] = compLevel.key)
      : types[value] = compLevel.key
    );

    return types;
  }, []);
}

function getMapNames(wadObj) {
  let i = 0;
  let mapNames = [];

  while (i < wadObj.lumps.length) {
    if (wadObj.detectLumpType(i) === MAP) {
      mapNames.push(wadObj.lumps[i].name);
    }

    i++;
  }

  return mapNames.sort();
}

function detectCompLevel(mapDataObj) {
  return [
    getCollectionCompLevel(mapDataObj.linedefs, "action", lineTypes),
    getCollectionFlagsCompLevel(mapDataObj.linedefs, lineFlags),
    getCollectionCompLevel(mapDataObj.sectors, "type", sectorTypes),
    getCollectionCompLevel(mapDataObj.things, "type", thingTypes),
    getCollectionFlagsCompLevel(mapDataObj.things, thingFlags)
  ].reduce(prioritize, "");
}

function getCollectionCompLevel(collection, key, compTable) {
  return collection.reduce((compLevel, item) => item[key] !== 0
    ? prioritize(compLevel, compTable[item[key]])
    : compLevel
  , "");
}

function getCollectionFlagsCompLevel(collection, compTable) {
  return collection.reduce((compLevel, item) => item.flags !== 0
    ? flagsToBits(item.flags).map(bit => compTable[bit]).reduce(prioritize, "")
    : compLevel
  , "");
}

function prioritize(currentCompLevel, newCompLevel) {
  return !currentCompLevel || priorities[newCompLevel] < priorities[currentCompLevel]
    ? newCompLevel
    : currentCompLevel;
}
