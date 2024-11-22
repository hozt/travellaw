import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function combineAndMoveCss() {
  const cssDirectory = path.join(__dirname, 'dist', '_astro');
  const outputFile = 'editor.css';
  const destinationDirectory = path.join(__dirname, 'dist');

  try {
    const files = await fs.readdir(cssDirectory);
    const cssFiles = files.filter(file => path.extname(file) === '.css');

    let combinedCss = '';
    for (const file of cssFiles) {
      const content = await fs.readFile(path.join(cssDirectory, file), 'utf8');
      combinedCss += content + '\n';
    }

    const destinationPath = path.join(destinationDirectory, outputFile);
    await fs.writeFile(destinationPath, combinedCss);

    console.log(`Combined CSS file created: ${destinationPath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

combineAndMoveCss();
