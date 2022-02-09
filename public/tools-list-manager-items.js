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
