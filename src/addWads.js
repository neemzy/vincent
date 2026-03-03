function addWads(wads, gameOrEpisode) {
  if (gameOrEpisode.iwad) {
    addWad(wads, gameOrEpisode.iwad);
  }

  if (gameOrEpisode.pwads) {
    gameOrEpisode.pwads.forEach(wad => addWad(wads, wad));
  }
}

module.exports = addWads;

function addWad(wads, wad) {
  if (!wads.includes(wad)) {
    wads.push(wad);
  }
}
