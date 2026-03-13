const fs = require("fs");
const {isWadOrPk3} = require("./isWad");

function getWadOrPk3Files(wadDir) {
  return fs.readdirSync(wadDir).filter(isWadOrPk3);
}

module.exports = {getWadOrPk3Files};
