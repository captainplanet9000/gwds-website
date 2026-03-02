Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\GWDS_Site"
WshShell.Run "cmd /c npx next dev -p 3457", 0, False
