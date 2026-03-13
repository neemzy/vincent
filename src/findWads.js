function findWads(wads, gameOrEpisode, availableFiles) {
  if (gameOrEpisode.iwad && !findWad(wads, gameOrEpisode.iwad, availableFiles)) {
    gameOrEpisode.disabled = true;
  }

  if (gameOrEpisode.pwads && !gameOrEpisode.pwads.every(wad => findWad(wads, wad, availableFiles))) {
    gameOrEpisode.disabled = true;
  }
}

function findWad(wads, wad, availableFiles) {
  const actualWad = availableFiles.find(file => file.toLowerCase() === wad);

  if (!Object.keys(wads).includes(wad)) {
    wads[wad] = actualWad;
  }

  return !!actualWad;
}

module.exports = {findWads, findWad};
