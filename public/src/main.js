// Load game metadata and user config
fetch("/config")
  .then(response => response.json())
  .then(config => {
    // Embed port data in profiles
    const profiles = config.profiles.map(profile => ({...profile, port: config.ports[profile.port]}));

    ReactDOM.createRoot(document.getElementById("root")).render(
      <GameForm
        wadDir={config.wadDir}
        profiles={profiles}
        games={config.games}
        skills={config.skills}
        defaultSkill={config.defaultSkill}
        availableWads={config.availableWads}
      />
    );
  });
