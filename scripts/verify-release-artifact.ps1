param(
  [Parameter(Mandatory = $true)]
  [string]$Path
)

$ErrorActionPreference = 'Stop'
$resolved = (Resolve-Path -LiteralPath $Path).Path
if ([IO.Path]::GetExtension($resolved).ToLowerInvariant() -ne '.zip') {
  throw 'Release artifact must be a .zip file.'
}

$entries = & tar -tf $resolved
if ($LASTEXITCODE -ne 0 -or -not $entries) {
  throw 'The archive could not be listed or is empty.'
}

$forbidden = @(
  '(^|/)\.env($|\.(?!example$))',
  '(^|/)\.git/',
  '(^|/)node_modules/',
  '(^|/)\.next/',
  '(^|/)(credentials?|secrets?)\.(json|ya?ml|txt)$',
  '(^|/)(.*\.)?(pem|p12|pfx|key)$',
  '(^|/)(.*\.)?(sqlite|sqlite3|db)$'
)

$violations = foreach ($entry in $entries) {
  foreach ($pattern in $forbidden) {
    if ($entry -match $pattern) { $entry; break }
  }
}

if ($violations) {
  $unique = $violations | Sort-Object -Unique
  throw "Forbidden release entries found:`n$($unique -join "`n")"
}

$requiredNames = @('README.md', 'LICENSE.md', '.env.example', 'package.json')
$missing = foreach ($name in $requiredNames) {
  if (-not ($entries | Where-Object { $_ -match "(^|/)$([regex]::Escape($name))$" })) { $name }
}
if ($missing) {
  throw "Required release files are missing: $($missing -join ', ')"
}

$file = Get-Item -LiteralPath $resolved
$hash = Get-FileHash -LiteralPath $resolved -Algorithm SHA256
[pscustomobject]@{
  Path = $resolved
  Bytes = $file.Length
  SHA256 = $hash.Hash.ToLowerInvariant()
  Entries = $entries.Count
  VerifiedAt = (Get-Date).ToUniversalTime().ToString('o')
} | ConvertTo-Json
