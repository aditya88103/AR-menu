$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Server started at http://localhost:8080/Restaurant-/"
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $response = $context.Response
        $request = $context.Request
        $localPath = $request.Url.LocalPath
        
        # Remove /Restaurant-/ prefix to map to local dist directory
        if ($localPath.StartsWith("/Restaurant-/")) {
            $localPath = $localPath.Substring(12)
        }
        
        if ($localPath -eq "/" -or $localPath -eq "") {
            $localPath = "/index.html"
        }
        
        $filePath = Join-Path (Get-Location).Path ("dist" + $localPath)
        $filePath = $filePath -replace "/", "\"
        
        if (Test-Path $filePath -PathType Leaf) {
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $buffer.Length
            
            if ($filePath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
            elseif ($filePath.EndsWith(".css")) { $response.ContentType = "text/css" }
            elseif ($filePath.EndsWith(".html")) { $response.ContentType = "text/html" }
            elseif ($filePath.EndsWith(".svg")) { $response.ContentType = "image/svg+xml" }
            elseif ($filePath.EndsWith(".json")) { $response.ContentType = "application/json" }
            elseif ($filePath.EndsWith(".png")) { $response.ContentType = "image/png" }
            elseif ($filePath.EndsWith(".glb")) { $response.ContentType = "model/gltf-binary" }
            
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    } catch {
        # Ignore errors
    }
}
