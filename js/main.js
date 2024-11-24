document.getElementById('closeBtn').addEventListener('click', () => {
  window.ipcRenderer.send('window-control', 'close');
});

document.getElementById('minimizeBtn').addEventListener('click', () => {
  window.ipcRenderer.send('window-control', 'minimize');
});

document.getElementById('maximizeBtn').addEventListener('click', () => {
  window.ipcRenderer.send('window-control', 'maximize');
});
    