function WadList({className, wads, selected, onSelect, onDelete, onApplyCompLevel}) {
  const [wadUrl, setWadUrl] = React.useState("");
  const [isDownloading, setDownloading] = React.useState(false);

  return (
    <div className={`${className} relative`}>
      <div className="absolute pointer-events-none inset-[-1em] top-[0.75em] bottom-0 border border-sky-600"></div>
      <div className="relative mb-2">
        <span className="doom-font bg-cyan-950 mx-[-0.375em] px-[0.375em]">Additional PWADs</span>
      </div>
      <ul className="w-full inline-flex flex-wrap">
        {wads.map(wad => (
          <li key={wad} className="w-1/2 shrink-0 odd:pr-2 even:pl-2">
            <label className="flex items-center">
              <input type="checkbox" checked={selected.includes(wad)} onChange={() => toggleWad(wad)} />
              <span
                className={`ml-2 truncate ${selected.includes(wad) ? " text-sky-400" : ""}`}
                title={wad}
              >{wad}</span>
              <button type="button" className="ml-auto cursor-pointer" title="Use suggested compatibility mode: MBF21" onClick={() => onApplyCompLevel(wad)}>💽</button>
              <button type="button" className="ml-1 cursor-pointer" title="" onClick={() => onDelete(wad)}>🗑️</button>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-2 pb-3 flex">
        <input
          type="url"
          className="grow bg-slate-900 focus:outline-none p-1 text-sm"
          placeholder="Paste /idgames URL..."
          value={wadUrl}
          onChange={event => setWadUrl(event.target.value)}
        />
        <button
          type="button"
          disabled={isDownloading}
          className="ml-2 w-[75px] underline hover:text-sky-400 cursor-pointer"
          onClick={async () => {
            setDownloading(true);
            await downloadWad(wadUrl);
            window.location.reload();
          }}
        >{isDownloading ? "⏳" : "Download"}</button>
      </div>
    </div>
  );

  function toggleWad(wad) {
    onSelect(selected.includes(wad)
      ? selected.filter(selectedWad => selectedWad !== wad)
      : [...selected, wad]
    );
  }
}
