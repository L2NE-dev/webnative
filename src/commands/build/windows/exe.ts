import { mkdir, writeFile } from "node:fs/promises";
import cleanup from "../../../utils/cleanup.js";
import { paths, prepareTmp } from "./common.js";
import { downloadMakensis } from "../../../utils/makensis.js";
import { join } from "node:path";
import exec from "../../../utils/exec.js";
import { WINDOWS_NODE_SETUP_URL } from "../../../utils/node.js";
import findBackend from "../../../utils/backend.js";
import { getConfig } from "../../../utils/config.js";

export default async function buildWindowsExe() {
  await downloadMakensis(paths.makensisDir);
  await prepareTmp({ bundleNode: false });
  await mkdir(paths.dist, { recursive: true });
  await packWindowsSetup();
  await cleanup();
}

async function packWindowsSetup() {
  const makensis =
    process.platform === "win32"
      ? join(paths.makensis, "windows", "makensis.exe")
      : join(paths.makensis, "linux", "x64", "makensis");

  const script = join(paths.tmp, "installer.nsi");
  await writeFile(script, await generateNsisScript());
  await exec(`${makensis} ${script}`);
}

async function generateNsisScript() {
  const hasBackend = await findBackend();
  const config = await getConfig();

  return `
!include "LogicLib.nsh"
!include "MUI2.nsh"
!insertmacro MUI_PAGE_INSTFILES

OutFile "${join(paths.dist, "setup.exe")}"
InstallDir "$PROGRAMFILES\\${config.name}"
RequestExecutionLevel admin

${
  hasBackend
    ? `
Section "Node.js"
	nsExec::ExecToStack 'where node'
	Pop $0
	Pop $1
	\${If} $0 == "0"
	\${Else}
		inetc::get "${WINDOWS_NODE_SETUP_URL}" "$TEMP\\node.msi" /END
		Pop $0
		ExecWait '"msiexec" /i "$TEMP\\node.msi" /norestart'
		Delete "$TEMP\\node.msi"
	\${EndIf}
SectionEnd
`
    : ""
}

Section "App"
  SetOutPath "$INSTDIR"
  File "${join(paths.tmp, "windows.exe")}"
  File "${join(paths.tmp, "WebView2Loader.dll")}"
  File "${join(paths.tmp, "webnative.json")}"
  File /r "${join(paths.tmp, "public")}"
  ${hasBackend ? `File /r "${join(paths.tmp, "backend")}"` : ""}

  WriteUninstaller "$INSTDIR\\uninstall.exe"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${config.name}" "DisplayName" "${config.name}"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${config.name}" "UninstallString" "$INSTDIR\\uninstall.exe"

	CreateShortcut "$DESKTOP\\${config.name}.lnk" "$INSTDIR\\windows.exe"
	CreateShortcut "$SMPROGRAMS\\${config.name}.lnk" "$INSTDIR\\windows.exe"
SectionEnd

Section "Uninstall"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${config.name}"
SectionEnd
`;
}
