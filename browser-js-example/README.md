To server this files as a test, you can use the following command

serve -l 8081

to install serve you need npm

npm install -g serve


In case of cors issue 
```Access to XMLHttpRequest at 'https://auth.aigent.com/auth/realms/dashboard/protocol/openid-connect/token' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.```

we recommend starting the serve command on port 8080 or 8081, these are accepted for testing purposes, all others will fail.

If those ports still don't work, contact help@aigent.ai