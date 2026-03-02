Set oShell = CreateObject("WScript.Shell")
oShell.CurrentDirectory = "C:\GWDS\gwds-website"
oShell.Run "cmd /c npm run dev", 0, False
