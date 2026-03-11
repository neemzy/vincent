function isWad(file) {
  return file.match(/\.(WAD|wad)$/);
}

function isWadOrPk3(file) {
  return file.match(/\.(WAD|wad|pk3)$/);
}

module.exports = {isWad, isWadOrPk3};
