$ErrorActionPreference = 'Stop'

$gameRoot = 'D:\Steam\steamapps\common\TCG Card Shop Simulator'
$managed = Join-Path $gameRoot 'Card Shop Simulator_Data\Managed'
$bepInExCore = Join-Path $gameRoot 'BepInEx\core'
$source = Join-Path $PSScriptRoot 'KaibaCardMappingDumper.cs'
$output = Join-Path $PSScriptRoot 'KaibaCardMappingDumper.dll'

$references = @(
    (Join-Path $bepInExCore 'BepInEx.dll'),
    (Join-Path $managed 'netstandard.dll'),
    (Join-Path $managed 'Assembly-CSharp.dll'),
    (Join-Path $managed 'UnityEngine.dll'),
    (Join-Path $managed 'UnityEngine.CoreModule.dll')
)

foreach ($reference in $references) {
    if (-not (Test-Path -LiteralPath $reference)) {
        throw "Fehlende Referenz: $reference"
    }
}

if (Test-Path -LiteralPath $output) {
    Remove-Item -LiteralPath $output -Force
}

Add-Type -TypeDefinition (Get-Content -LiteralPath $source -Raw) `
    -ReferencedAssemblies $references `
    -OutputAssembly $output `
    -OutputType Library `
    -Language CSharp

Get-Item -LiteralPath $output | Select-Object FullName, Length
