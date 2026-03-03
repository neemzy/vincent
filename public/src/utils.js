function buildCommandLine(wadDir, profile, game, episode, episodeIndex, mapNumber, pWads, skillIndex, isMusicEnabled) {
  const baseParams = {
    ...buildWadParams(wadDir, game, episode, [...pWads, ...(profile.pwads || [])]),
    ...(mapNumber > 0 ? {
      warp: getWarpValue(game, parseInt(episodeIndex) + 1, mapNumber),
      skill: `${parseInt(skillIndex) + 1}`
    } : {}),
    nomusic: !isMusicEnabled
  };

  const profileParams = (profile.params || []).length > 0
    ? ` ${(profile.params || []).join(" ")}`
    : "";

  return `${profile.port.path} ${formatParams(baseParams)}${profileParams}`;
}

function buildWadParams(wadDir, game, episode, pWads) {
  return {
    iwad: formatWad(wadDir, episode.iwad || game.iwad),
    file: [...formatWads(wadDir, game.pwads), ...formatWads(wadDir, episode.pwads), ...formatWads(wadDir, pWads)]
  }
}

function getWarpValue(game, episodeNumber, mapNumber) {
  const iwad = (game.iwad || "").toLowerCase();
  const pwads = game.pwads || [];

  // Doom/Freedoom 1: ExMy format
  if (["doom.wad", "freedoom1.wad"].includes(iwad)) {
    return `${episodeNumber} ${mapNumber}`;
  }

  // Legacy of Rust: ExMy format but weird, also not really
  if (pwads.includes("id1.wad") && episodeNumber === 2 && mapNumber < 8) {
    return mapNumber + 7;
  }

  return mapNumber;
}

function formatWad(wadDir, wad) {
  return `${wadDir}/${wad}`;
}

function formatWads(wadDir, wads) {
  return (wads || []).map(wad => formatWad(wadDir, wad)); // silently handle undefined *.pwads
}

function formatParams(params) {
  return Object.entries(params)
    .filter(([paramName, paramValue]) => (!Array.isArray(paramValue) && !!paramValue) || paramValue.length > 0) // exclude empty/falsy parameters
    .map(param => formatParam(...param))
    .join(" ");
}

function formatParam(paramName, paramValue) {
  const formattedValue = formatParamValue(paramValue);
  return `-${paramName}${formattedValue ? ` ${formattedValue}` : ""}`;
}

function formatParamValue(paramValue) {
  // Boolean parameters have no explicit value
  if (paramValue === true) {
    return false;
  }

  return Array.isArray(paramValue)
    ? paramValue.join(" ")
    : paramValue;
}
