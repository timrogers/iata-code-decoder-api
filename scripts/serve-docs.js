import express from 'express';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-dist';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.DOCS_PORT || 3001;

// Load OpenAPI spec
const openApiYaml = fs.readFileSync(path.join(__dirname, '..', 'openapi.yaml'), 'utf8');
const openApiSpec = yaml.load(openApiYaml);

// Serve swagger-ui assets
const swaggerUiAssetPath = swaggerUi.getAbsoluteFSPath();
app.use('/swagger-ui', express.static(swaggerUiAssetPath));

// Serve the OpenAPI spec
app.get('/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

// Serve the main documentation page
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>IATA Code Decoder API Documentation</title>
  <link rel="stylesheet" type="text/css" href="/swagger-ui/swagger-ui-bundle.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  
  <script src="/swagger-ui/swagger-ui-bundle.js"></script>
  <script src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
  `;
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`📖 OpenAPI documentation is running at http://localhost:${PORT}`);
  console.log(`📝 OpenAPI spec available at http://localhost:${PORT}/openapi.json`);
});