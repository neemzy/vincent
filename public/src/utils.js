function getTitleOptions(collection) {
  return collection.map(({title}, index) => ({
    label: title,
    value: index
  }));
}

function buildCommandLine(wadDir, profile, game, episode, episodeNumber, mapNumber, skill, compLevel, pWads, isMusicEnabled) {
  const baseParams = {
    ...buildWadParams(wadDir, game, episode, pWads),
    ...(!isNaN(mapNumber) ? {
      warp: getWarpValue(game, episodeNumber, mapNumber),
      skill
    } : {}),
    nomusic: !isMusicEnabled
  };

  return [
    profile.port.path,
    formatParams(baseParams),
    formatParams(profile.params),
    compLevel ? formatParams(buildCompLevelParams(profile, compLevel)) : ""
  ].join(" ").replace(/\s+/, " ").trim();
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

  // ExMy format
  if (game.usesExMyFormat) {
    return `${episodeNumber} ${mapNumber}`;
  }

  // Legacy of Rust: ExMy format but weird (also not really)
  if (pwads.includes("id1.wad")) {
    // Secrets levels: ExM0 -> MAPx+14 (E1M0 -> MAP15, E2M0 -> MAP16)
    if (mapNumber === 0) {
      return episodeNumber + 14;
    }

    // E2My -> MAPy+7 (E2M1 -> MAP08, ..., E2M7 -> MAP14)
    if (episodeNumber === 2 && mapNumber < 8) {
      return mapNumber + 7;
    }
  }

  //MAPy format
  return mapNumber;
}

function formatWad(wadDir, wad) {
  return `${wadDir}/${wad}`;
}

function formatWads(wadDir, wads) {
  return (wads || []).map(wad => formatWad(wadDir, wad)); // silently handle undefined *.pwads
}

function formatParams(params = "") {
  if (typeof params === "string") {
    return params;
  }

  if (Array.isArray(params)) {
    return params.join(" ");
  }

  return Object.entries(params)
    .filter(([paramName, paramValue]) => (!Array.isArray(paramValue) && !!paramValue) || paramValue.length > 0) // exclude empty/falsy parameters
    .map(([paramName, paramValue]) => `-${paramName} ${formatParamValue(paramValue)}`)
    .join(" ");
}

function formatParamValue(paramValue) {
  // Boolean parameters have no explicit value
  if (paramValue === true) {
    return "";
  }

  return Array.isArray(paramValue)
    ? paramValue.join(" ")
    : paramValue;
}

function buildCompLevelParams(profile, compLevel) {
  if (profile.port.compLevels?.[compLevel.key]) {
    return profile.port.compLevels[compLevel.key];
  }

  return "";
}

function profileIsCompatible(profile, compLevel) {
  return Object.keys(profile.port.compLevels || {}).includes(compLevel);
}
