#!/usr/bin/env node
/**
 * Schema Generator
 * Analyzes Express routes and generates Fastify JSON schemas
 */

const fs = require('fs');
const path = require('path');

class SchemaGenerator {
  constructor() {
    this.schemas = new Map();
  }

  /**
   * Generate schema from sample data
   */
  inferSchemaFromSample(sample, required = true) {
    if (Array.isArray(sample)) {
      return {
        type: 'array',
        items: this.inferSchemaFromSample(sample[0], false),
      };
    }

    if (typeof sample === 'object' && sample !== null) {
      const properties = {};
      const requiredFields = [];

      for (const [key, value] of Object.entries(sample)) {
        properties[key] = this.inferSchemaFromSample(value, false);
        if (required) {
          requiredFields.push(key);
        }
      }

      const schema = {
        type: 'object',
        properties,
      };

      if (requiredFields.length > 0) {
        schema.required = requiredFields;
      }

      return schema;
    }

    // Primitive types
    if (typeof sample === 'string') {
      // Check for common formats
      if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(sample)) {
        return { type: 'string', format: 'email' };
      }
      if (/^\d{4}-\d{2}-\d{2}/.test(sample)) {
        return { type: 'string', format: 'date-time' };
      }
      if (/^https?:\/\//.test(sample)) {
        return { type: 'string', format: 'uri' };
      }
      return { type: 'string' };
    }

    if (typeof sample === 'number') {
      return Number.isInteger(sample) ? { type: 'integer' } : { type: 'number' };
    }

    if (typeof sample === 'boolean') {
      return { type: 'boolean' };
    }

    return { type: 'string' }; // fallback
  }

  /**
   * Generate route schema configuration
   */
  generateRouteSchema(options = {}) {
    const { method, path, bodyExample, queryExample, responseExample, headers } = options;

    const schema = {};

    // Body schema
    if (bodyExample && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      schema.body = this.inferSchemaFromSample(bodyExample);
    }

    // Query schema
    if (queryExample) {
      schema.querystring = this.inferSchemaFromSample(queryExample, false);
    }

    // Headers schema
    if (headers) {
      schema.headers = {
        type: 'object',
        properties: {},
      };

      for (const [key, example] of Object.entries(headers)) {
        schema.headers.properties[key.toLowerCase()] = this.inferSchemaFromSample(
          example,
          false,
        );
      }
    }

    // Response schema
    if (responseExample) {
      const statusCode = options.successStatus || 200;
      schema.response = {
        [statusCode]: this.inferSchemaFromSample(responseExample),
      };
    }

    return schema;
  }

  /**
   * Generate complete route definition with schema
   */
  generateFastifyRoute(options = {}) {
    const { method = 'GET', path, handlerName = 'handler', description } = options;

    const schema = this.generateRouteSchema(options);
    const hasSchema = Object.keys(schema).length > 0;

    let code = `// ${description || `${method} ${path}`}\n`;
    code += `fastify.${method.toLowerCase()}('${path}'`;

    if (hasSchema) {
      code += `, {\n  schema: ${JSON.stringify(schema, null, 4)}\n}`;
    }

    code += `, async (request, reply) => {\n`;
    code += `  // TODO: Implement handler logic\n`;

    // Add parameter access hints
    if (schema.body) {
      code += `  // Access body: request.body\n`;
    }
    if (schema.querystring) {
      code += `  // Access query: request.query\n`;
    }
    if (path.includes(':')) {
      code += `  // Access params: request.params\n`;
    }

    code += `  return { message: 'Not implemented' };\n`;
    code += `});\n`;

    return code;
  }

  /**
   * Generate schema file from route definitions
   */
  generateSchemaFile(routes, outputPath) {
    let content = `// Auto-generated Fastify schemas\n\n`;

    routes.forEach((route) => {
      const routeId = `${route.method}_${route.path.replace(/[/:]/g, '_')}`;
      const schema = this.generateRouteSchema(route);

      if (Object.keys(schema).length > 0) {
        content += `export const ${routeId}_schema = ${JSON.stringify(schema, null, 2)};\n\n`;
      }
    });

    fs.writeFileSync(outputPath, content);
    console.log(`✅ Schema file generated: ${outputPath}`);
  }

  /**
   * Generate complete Fastify routes file
   */
  generateRoutesFile(routes, outputPath) {
    let content = `// Auto-generated Fastify routes\n\n`;
    content += `module.exports = async function (fastify, opts) {\n\n`;

    routes.forEach((route) => {
      content += `  ${this.generateFastifyRoute(route)}\n`;
    });

    content += `};\n`;

    fs.writeFileSync(outputPath, content);
    console.log(`✅ Routes file generated: ${outputPath}`);
  }

  /**
   * Analyze Express app and suggest schemas
   */
  analyzeExpressApp(expressAppPath) {
    console.log(`📊 Analyzing Express app: ${expressAppPath}`);

    // This is a simplified analysis - in practice, you'd use AST parsing
    // For now, provide manual specification
    console.log(`
⚠️  Manual schema specification recommended.

Create a routes.json file with your route definitions:

[
  {
    "method": "POST",
    "path": "/api/users",
    "description": "Create a new user",
    "bodyExample": {
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30
    },
    "responseExample": {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
]

Then run: node schema_generator.js --input routes.json --output ./generated
    `);
  }
}

// CLI
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
Schema Generator for Fastify Migration

Usage:
  node schema_generator.js --input <routes.json> --output <dir>
  node schema_generator.js --analyze <express-app.js>

Options:
  --input <file>    JSON file with route definitions
  --output <dir>    Output directory for generated files
  --analyze <file>  Analyze Express app file

Example routes.json:
[
  {
    "method": "GET",
    "path": "/api/users/:id",
    "description": "Get user by ID",
    "responseExample": {
      "id": "123",
      "name": "John Doe"
    }
  }
]
    `);
    return;
  }

  const generator = new SchemaGenerator();

  const inputIndex = args.indexOf('--input');
  const outputIndex = args.indexOf('--output');
  const analyzeIndex = args.indexOf('--analyze');

  if (analyzeIndex !== -1) {
    const appPath = args[analyzeIndex + 1];
    generator.analyzeExpressApp(appPath);
    return;
  }

  if (inputIndex !== -1 && outputIndex !== -1) {
    const inputFile = args[inputIndex + 1];
    const outputDir = args[outputIndex + 1];

    // Read route definitions
    const routes = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate files
    generator.generateSchemaFile(routes, path.join(outputDir, 'schemas.js'));
    generator.generateRoutesFile(routes, path.join(outputDir, 'routes.js'));

    console.log(`\n✨ Generation complete!`);
    console.log(`   Schemas: ${path.join(outputDir, 'schemas.js')}`);
    console.log(`   Routes:  ${path.join(outputDir, 'routes.js')}`);
  } else {
    console.log('Error: --input and --output are required');
    console.log('Run with --help for usage information');
  }
}

if (require.main === module) {
  main();
}

module.exports = SchemaGenerator;
