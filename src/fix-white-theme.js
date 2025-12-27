const fs = require('fs');
const path = require('path');

// Recursively find all .tsx files
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        findTsxFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Remove all dark: classes from a string
function removeDarkClasses(content) {
  // Match dark: followed by any characters until whitespace, quote, or closing brace
  // This regex handles: dark:bg-gray-800/95, dark:text-red-400, etc.
  return content.replace(/\s+dark:[^\s"'}]*/g, '');
}

// Process all files
function processFiles() {
  const componentsDir = path.join(__dirname, 'components');
  const files = findTsxFiles(componentsDir);
  
  console.log(`Found ${files.length} TypeScript files to process...`);
  
  let changedFiles = 0;
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = removeDarkClasses(content);
    
    if (content !== newContent) {
      fs.writeFileSync(file, newContent);
      changedFiles++;
      console.log(`✓ Fixed: ${file.replace(__dirname, '')}`);
    }
  });
  
  console.log(`\nProcessed ${files.length} files, modified ${changedFiles} files.`);
  console.log('All dark: classes have been removed!');
}

// Run the script
processFiles();
