const DOOM2_INDEX = 1;

function GameForm({wadDir, profiles, games, skills, defaultSkill, compLevels, knownWads, availableWads}) {
  const [selectedProfile, selectProfile] = React.useState(0);
  const [selectedGame, selectGame] = React.useState(getDefaultSelectedGameIndex());
  const [selectedEpisode, selectEpisode] = React.useState(0);
  const [isWarpEnabled, enableWarp] = React.useState(false);
  const [mapNumber, setMapNumber] = React.useState(1);
  const [selectedSkill, selectSkill] = React.useState(profiles[0].defaultSkill || defaultSkill);
  const [isMusicEnabled, enableMusic] = React.useState(true);
  const [selectedCompLevel, selectCompLevel] = React.useState();
  const [selectedWads, selectWads] = React.useState([]);
  const [isRunButtonEnabled, enableRunButton] = React.useState(true);
  const [isCopyAlertVisible, showCopyAlert] = React.useState(false);
  const profileOptions = getTitleOptions(profiles);
  const isPortConfigurable = !!profiles[selectedProfile].port.setupPath;
  const gameOptions = getTitleOptions(games);
  const episodeOptions = getEpisodeOptions(selectedGame);
  const skillOptions = skills.map((skill, index) => ({label: skill, value: index + 1}));
  const compLevelOptions = React.useMemo(getCompLevelOptions, [selectedProfile, selectedGame]);
  const minMapNumber = React.useMemo(() => games[selectedGame].hasMapZero ? 0 : 1, [selectedGame]);

  const maxMapNumber = React.useMemo(() => games[selectedGame].episodes[selectedEpisode].maxMapNumber
    || games[selectedGame].maxMapNumber, [selectedGame, selectedEpisode]);

  // Reset compatibility mode dropdown when a different source port or game is selected
  React.useEffect(() => {
    if (!compLevelOptions.find(option => option.value === selectedCompLevel)) { // meh
      selectCompLevel(compLevelOptions[0].value);
    }
  }, [compLevelOptions]);

  // Build command line
  const commandLine = React.useMemo(() => buildCommandLine(
    wadDir,
    knownWads,
    profiles[selectedProfile],
    games[selectedGame],
    games[selectedGame].episodes[selectedEpisode],
    parseInt(selectedEpisode) + 1,
    isWarpEnabled ? mapNumber : undefined,
    selectedSkill,
    compLevels.find(compLevel => compLevel.key === selectedCompLevel), // meh
    selectedWads,
    isMusicEnabled
  ), [selectedProfile, selectedGame, selectedEpisode, isWarpEnabled, mapNumber, selectedSkill, selectedCompLevel, selectedWads, isMusicEnabled]);

  return (
    <div className="min-h-screen py-8 bg-cyan-950 text-sky-600">
      <div className="doom-logo mx-auto"></div>
      <form className="max-w-4xl mt-16 mx-auto" onSubmit={event => handleRun(event, commandLine)}>
        <div className="max-w-lg mx-auto grid grid-cols-6 grid-flow-row">
          <label htmlFor="profile" className="col-span-2 doom-font">Source port</label>
          <Dropdown
            id="profile"
            className={`col-span-${isPortConfigurable ? "3" : "4"} text-sky-400`}
            options={profileOptions}
            value={selectedProfile}
            onChange={handleSelectProfile}
          />
          {isPortConfigurable && (
            <div className="col-span-1 text-right">
              <button
                type="button"
                className="underline hover:text-sky-400 cursor-pointer"
                onClick={event => handleRun(event, profiles[selectedProfile].port.setupPath)}
              >Setup...</button>
            </div>
          )}
          <label htmlFor="game" className="col-span-2 doom-font">Game</label>
          <Dropdown
            id="game"
            className="col-span-4 text-sky-400"
            options={gameOptions}
            value={selectedGame}
            onChange={handleSelectGame}
          />
          <label htmlFor="episode" className="col-span-2 doom-font">Episode</label>
          <Dropdown
            id="episode"
            className="col-span-4 text-sky-400"
            options={episodeOptions}
            value={selectedEpisode}
            onChange={handleSelectEpisode}
          />
          <label htmlFor="warp" className="col-span-2 doom-font">Start game</label>
          <div className="col-span-4">
            <input type="checkbox" id="warp" checked={isWarpEnabled} onChange={event => enableWarp(event.target.checked)} />
          </div>
          <label htmlFor="map" className={`col-span-2 doom-font${isWarpEnabled ? "" : " text-slate-600"}`}>Map number</label>
          <input
            type="number"
            id="map"
            className="col-span-4 text-sky-400 disabled:text-slate-600"
            disabled={!isWarpEnabled}
            min={minMapNumber}
            max={maxMapNumber}
            value={mapNumber}
            onChange={event => {
              const value = parseInt(event.target.value);

              if (!isNaN(value)) {
                setMapNumber(Math.min(maxMapNumber, Math.max(minMapNumber, value)));
              }
            }}
          />
          <label htmlFor="skill" className={`col-span-2 doom-font${isWarpEnabled ? "" : " text-slate-600"}`}>Skill level</label>
          <Dropdown
            id="skill"
            className="col-span-4 text-sky-400 disabled:text-slate-600"
            disabled={!isWarpEnabled}
            options={skillOptions}
            value={selectedSkill}
            onChange={selectSkill}
          />
          <label htmlFor="music" className="col-span-2 doom-font">Music</label>
          <div className="col-span-4">
            <input type="checkbox" id="music" checked={isMusicEnabled} onChange={event => enableMusic(event.target.checked)} />
          </div>
        </div>
        <div className="mt-8 max-w-lg mx-auto grid grid-cols-6 grid-flow-row">
          <label htmlFor="compLevel" className="col-span-3 doom-font">Compatibility mode</label>
          <Dropdown
            id="compLevel"
            className="col-span-3 text-sky-400"
            options={compLevelOptions}
            value={selectedCompLevel}
            onChange={selectCompLevel}
          />
        </div>
        <WadList
          className="max-w-lg mt-8 mx-auto"
          wads={availableWads}
          selected={selectedWads}
          onSelect={selectWads}
          onDelete={async wad => {
            if (!confirm(`Delete ${wad}?`)) {
              return;
            }

            await deleteWad(wad);
            window.location.reload();
          }}
          onApplySettings={applySettings}
        />
        <div className="mt-16 flex items-center p-4 rounded-md bg-slate-800">
          <span className="pr-4 font-mono text-xs text-slate-200 cursor-pointer" onClick={copyCommandLine}>{commandLine}</span>
          <button
            type="submit"
            className="ml-auto px-2 py-1 rounded-sm bg-sky-600 hover:bg-sky-400 text-slate-800 doom-font uppercase cursor-pointer"
            disabled={!isRunButtonEnabled}
          >Run</button>
        </div>
        <div className={`${isCopyAlertVisible ? "" : "hidden "}mt-2 text-center text-sm text-sky-400`}>Copied to clipboard!</div>
      </form>
    </div>
  );

  function getDefaultSelectedGameIndex() {
    const availableIndexes = games.reduce((indexes, game, index) => {
      if (!game.disabled) {
        indexes.push(index);
      }

      return indexes;
    }, []);

    // Default to Doom II if it is available
    return availableIndexes.includes(DOOM2_INDEX)
      ? DOOM2_INDEX
      : availableIndexes[0];
  }

  function getEpisodeOptions(gameIndex) {
    if (!games[gameIndex]) {
      return [];
    }

    return getTitleOptions(games[gameIndex].episodes);
  }

  // Filter compatibility modes by selected source port and IWAD
  function getCompLevelOptions() {
    return compLevels.reduce((options, {key, label, iwads}) => {
      iwads = iwads || [];

      if ((
        profileIsCompatible(profiles[selectedProfile], key)
      ) && (
        iwads.length === 0
        // Exclude mismatching vanilla complevels
        || iwads.includes(games[selectedGame].episodes[selectedEpisode].iwad)
        || iwads.includes(games[selectedGame].iwad)
      )) {
        options.push({label, value: key});
      }

      return options;
    }, []);
  }

  function handleSelectProfile(profileIndex) {
    selectProfile(profileIndex);

    if (profiles[profileIndex].defaultSkill) {
      selectSkill(profiles[profileIndex].defaultSkill);
    }
  }

  function handleSelectGame(gameIndex, episodeIndex = 0, mapNumber = 1) {
    selectGame(gameIndex);
    handleSelectEpisode(episodeIndex, mapNumber);
  }

  function handleSelectEpisode(episodeIndex, mapNumber = 1) {
    selectEpisode(episodeIndex);
    setMapNumber(mapNumber);
  }

  function handleRun(event, commandLine) {
    event.preventDefault();
    enableRunButton(false);

    runCommandLine(commandLine)
      .then(() => enableRunButton(true));
  }

  function applySettings({file, compLevel, firstMap}) {
    // Find 1st available IWAD with matching map format
    handleSelectGame(
      games.findIndex(game => game.iwad && !game.disabled && (!!game.usesExMyFormat === (firstMap.episode > 0))),
      Math.max(0, firstMap.episode - 1),
      firstMap.map
    );

    if (compLevel === selectedCompLevel) {
      return;
    }

    // Assume source ports are registered from most strict to least strict
    handleSelectProfile(Math.max(0, profiles.findIndex(profile => profileIsCompatible(profile, compLevel))));

    selectCompLevel(compLevel);
  }

  function copyCommandLine() {
    window.navigator.clipboard.writeText(commandLine);
    showCopyAlert(true);

    window.setTimeout(() => {
      showCopyAlert(false);
    }, 1500);
  }
}
