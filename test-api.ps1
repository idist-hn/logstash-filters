# Test API endpoints
Write-Host "Testing CloudWatch ELK API..."

# Test login
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    Write-Host "✅ Login successful"
    $token = $loginResponse.token
    
    # Test dashboard endpoint
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $dashboardResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dashboard" -Method GET -Headers $headers
    Write-Host "✅ Dashboard API working"
    
    # Test cluster health
    $clusterResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/metrics/cluster" -Method GET -Headers $headers
    Write-Host "✅ Cluster health API working"
    Write-Host "Cluster status: $($clusterResponse.status)"
    
} catch {
    Write-Host "❌ API test failed: $($_.Exception.Message)"
}
