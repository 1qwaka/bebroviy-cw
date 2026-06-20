#!/bin/sh
cat > /usr/share/nginx/html/config.js << EOF
window.__config__ = {
  idpUrl: "${IDP_URL}",
  apiUrl: "${API_URL}",
  clientId: "${CLIENT_ID}"
};
EOF

exec nginx -g 'daemon off;'