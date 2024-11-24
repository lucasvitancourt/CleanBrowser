class Settings {
  constructor() {
    this.settings = {
      theme: 'light',
      homePage: 'https://google.com',
      searchEngine: 'google'
    };
    this.init();
  }

  init() {
    this.loadSettings();
    this.setupEventListeners();
  }

  loadSettings() {
    const saved = localStorage.getItem('settings');
    if (saved) {
      this.settings = JSON.parse(saved);
      this.applySettings();
    }
  }

  saveSettings() {
    localStorage.setItem('settings', JSON.stringify(this.settings));
  }

  applySettings() {
    document.documentElement.setAttribute('data-theme', this.settings.theme);
    document.getElementById('homePageInput').value = this.settings.homePage;
    document.getElementById('searchEngineSelect').value = this.settings.searchEngine;
  }

  setupEventListeners() {
    document.getElementById('saveSettings').addEventListener('click', () => {
      this.settings.theme = document.querySelector('.theme-option.active').dataset.theme;
      this.settings.homePage = document.getElementById('homePageInput').value;
      this.settings.searchEngine = document.getElementById('searchEngineSelect').value;
      this.saveSettings();
      this.applySettings();
    });

    document.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
      });
    });
  }
}

window.settings = new Settings();
    