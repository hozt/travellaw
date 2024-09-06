import { request, gql } from 'graphql-request';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let endpoint = process.env.API_URL;

if (!endpoint) {
  throw new Error('GRAPHQL_URL environment variable is not set');
}

endpoint = `${endpoint}/graphql`;

const query = gql`
  query {
    customSiteSettings {
      editorKey
    }
  }
`;

const fetchEditorKey = async () => {
  try {
    const data = await request(endpoint, query);
    return data.customSiteSettings.editorKey;
  } catch (error) {
    console.error('Error fetching editor key:', error);
  }
};

const editorKey = await fetchEditorKey();

const filePath = path.join(__dirname, '/functions/admin-menu.js');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Replace the editorKey value
fileContent = fileContent.replace(
  /const editorKey = '.*';/,
  `const editorKey = '${editorKey}';`
);

fs.writeFileSync(filePath, fileContent);

console.log(`Updated editorKey to: ${editorKey}`);