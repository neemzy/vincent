function runCommandLine(commandLine) {
  return fetch("/run", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({commandLine})
  });
}

function downloadWad(url) {
  return fetch("/download", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({url})
  });
}

function deleteWad(wadFile) {
  if (!confirm(`Delete ${wadFile}?`)) {
    return;
  }

  return fetch(`/delete?file=${wadFile}`);
}
