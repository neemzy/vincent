function isWad(file) {
  return file.match(/\.wad$/i);
}

function isWadOrPk3(file) {
  return file.match(/\.(wad|pk3)$/i);
}

module.exports = {isWad, isWadOrPk3};
