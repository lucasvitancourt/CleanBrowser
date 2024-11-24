module.exports = {
  appId: "com.cleanbrowser.app",
  productName: "Clean Browser",
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      }
    ],
    icon: "./assets/icon.ico",
    forceCodeSigning: false,
    signAndEditExecutable: false,
    verifyUpdateCodeSignature: false
  },
  nsis: {
    oneClick: true,
    perMachine: false,
    allowToChangeInstallationDirectory: false,
    deleteAppDataOnUninstall: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Clean Browser",
    installerIcon: "./assets/icon.ico",
    uninstallerIcon: "./assets/icon.ico",
    artifactName: "CleanBrowserSetup.exe"
  },
  directories: {
    output: "dist",
    buildResources: "assets"
  },
  files: [
    "**/*",
    "assets/*"
  ],
  asar: true,
  compression: "maximum",
  removePackageScripts: true,
  removePackageKeywords: true,
  forceCodeSigning: false,
  buildDependenciesFromSource: true,
  npmRebuild: false,
  electronVersion: "29.1.4",
  beforeBuild: () => true,
  afterSign: () => true,
  artifactBuildStarted: () => true,
  artifactBuildCompleted: () => true
} 