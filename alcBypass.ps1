Set-Location "C:\Users\jsteinca\Documents\Git\playwright"
$tests = @("download program", "check faults", "low voltage", "evap section", "bypass", "motor section")

try {
	foreach ($test in $tests) {
		npx playwright test -g $test
	}
} catch {
    Write-Error "an error occured $_"
}