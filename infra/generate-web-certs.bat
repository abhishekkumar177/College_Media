@echo off
echo Generating Web SSL Certificates for HTTPS...

set OUTPUT_DIR=..\certs
if not exist %OUTPUT_DIR% mkdir %OUTPUT_DIR%

REM Generate private key
echo Generating private key...
openssl genrsa -out %OUTPUT_DIR%\web.key 2048

REM Generate certificate signing request
echo Generating certificate signing request...
openssl req -new -key %OUTPUT_DIR%\web.key -out %OUTPUT_DIR%\web.csr -subj "/C=US/ST=State/L=City/O=CollegeMedia/CN=localhost"

REM Generate self-signed certificate
echo Generating self-signed certificate...
openssl x509 -req -days 365 -in %OUTPUT_DIR%\web.csr -signkey %OUTPUT_DIR%\web.key -out %OUTPUT_DIR%\web.crt

REM Cleanup CSR
del %OUTPUT_DIR%\web.csr 2>nul

echo.
echo Web SSL certificates generated in %OUTPUT_DIR%:
echo - web.key (private key)
echo - web.crt (certificate)
echo.
echo To use these certificates, set environment variables:
echo SSL_KEY_PATH=%OUTPUT_DIR%\web.key
echo SSL_CERT_PATH=%OUTPUT_DIR%\web.crt
echo.
pause
