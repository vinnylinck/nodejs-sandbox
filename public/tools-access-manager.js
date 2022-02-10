// eslint-disable-next-line no-unused-vars
function toggleScope(ref) {
  const uri = `${window.location.href}/scopes`;
  const token = document.getElementById('token').value;

  const data = {};
  data[ref.name] = ref.checked;

  fetch(
    uri,
    {
      method: 'PATCH',
      headers: { 'XSRF-TOKEN': token, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  ).then((res) => {
    if (!res.ok) {
      alert(res.statusText);// eslint-disable-line no-alert
    }

    window.location.reload();
  });
}

// eslint-disable-next-line no-unused-vars
function clearSessions() {
  const uri = `${window.location.href}/sessions`;
  const token = document.getElementById('token').value;

  // eslint-disable-next-line no-restricted-globals, no-alert
  if (!confirm('Do you want clean up the other sessions (and keep only this active)?')) {
    return;
  }

  fetch(
    uri,
    {
      method: 'DELETE',
      headers: { 'XSRF-TOKEN': token },
    },
  ).then((res) => {
    if (!res.ok) {
      alert(res.statusText);// eslint-disable-line no-alert
    }

    window.location.reload();
  });
}
