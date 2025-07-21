Write-Host 'Setting IP to 169.254.1.2'
netsh interface ipv4 set address name="Ethernet" static 169.254.1.2

Start-Sleep -Seconds 2

Set-Location "C:\Users\jsteinca\Documents\Git\playwright"

try {
    npx playwright test tests/ALC/setControllerIP.spec.ts
} catch {
    Write-Error "set controller IP failed."
}

Start-Sleep -Seconds 2

Write-Host 'Setting IP to 192.168.168.128'
netsh interface ipv4 set address name="Ethernet" static 192.168.168.128

Start-Sleep -Seconds 5