// eslint-disable-next-line no-unused-vars
function deleteItem(iid) {
  const uri = `${window.location.href}/${iid}`;
  const token = document.getElementById('token').value;

  fetch(uri, { method: 'DELETE', headers: { 'XSRF-TOKEN': token } })
    .then((res) => {
      if (res.ok) {
        window.location.reload(true);
      } else {
        alert(res.statusText);// eslint-disable-line no-alert
      }
    });
}

// eslint-disable-next-line no-unused-vars
function toggleItem(iid, value) {
  const uri = `${window.location.href}/${iid}`;
  const token = document.getElementById('token').value;
  const ok = !value;

  fetch(
    uri,
    {
      method: 'PATCH',
      headers: { 'XSRF-TOKEN': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok }),
    },
  ).then((res) => {
    if (res.ok) {
      window.location.reload(true);
    } else {
      alert(res.statusText);// eslint-disable-line no-alert
    }
  });
}

// eslint-disable-next-line no-unused-vars
function deleteList(lid) {
  const uri = `${window.location.href}/${lid}`;
  const token = document.getElementById('token').value;

  fetch(uri, { method: 'DELETE', headers: { 'XSRF-TOKEN': token } })
    .then((res) => {
      if (res.ok) {
        window.location.reload(true);
      } else {
        alert(res.statusText);// eslint-disable-line no-alert
      }
    });
}

// eslint-disable-next-line no-unused-vars
function updateList() {
  const uri = `${window.location.href}`;
  const token = document.getElementById('token').value;
  const name = document.getElementById('list-name').value;

  fetch(
    uri,
    {
      method: 'PUT',
      headers: { 'XSRF-TOKEN': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    },
  ).then((res) => {
    if (res.ok) {
      document.getElementById('back-link').click();
    } else {
      alert(res.statusText);// eslint-disable-line no-alert
    }
  });
}
