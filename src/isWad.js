function isWad(file) {
  return file.match(/\.(WAD|wad|pk3)$/);
}

module.exports = isWad;
