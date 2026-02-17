; Script Inno Setup pour IDEAL GESTION
; Génère un installateur .exe professionnel

#define MyAppName "IDEAL GESTION"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "IDEAL"
#define MyAppExeName "IDEAL GESTION.exe"
#define MyAppURL "https://www.ideal.dz"

[Setup]
; Informations de base
AppId={{A3B8D1B6-0B3B-4B1A-9C1A-1A2B3C4D5E6F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Répertoires d'installation
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; Sortie
OutputDir=dist
OutputBaseFilename=IDEAL-GESTION-Setup-{#MyAppVersion}
; SetupIconFile=public\icon-512x512.png  ; Commenté - nécessite un fichier .ico
Compression=lzma2/max
SolidCompression=yes

; Privilèges (pas besoin d'admin)
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog

; Interface moderne
WizardStyle=modern

; Langue
ShowLanguageDialog=no
LanguageDetectionMethod=none

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Copier tout le contenu de dist/win-unpacked
Source: "dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Icône dans le menu Démarrer
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Désinstaller {#MyAppName}"; Filename: "{uninstallexe}"

; Icône sur le bureau (si l'utilisateur l'a choisi)
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
; Proposer de lancer l'application après l'installation
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; Nettoyer les fichiers temporaires lors de la désinstallation
Type: filesandordirs; Name: "{app}\*"

[Code]
// Message d'information sur la base de données persistante
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    MsgBox('Installation terminée !' + #13#10#13#10 + 
           'Note : Les données de l''application sont stockées dans :' + #13#10 +
           ExpandConstant('{userappdata}\IDEAL GESTION') + #13#10#13#10 +
           'Elles seront conservées même si vous désinstallez l''application.',
           mbInformation, MB_OK);
  end;
end;
