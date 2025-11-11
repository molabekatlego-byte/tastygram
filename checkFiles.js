const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src'); // adjust if your src folder is elsewhere

function listFiles(dir, prefix = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(entry => {
    if (entry.isDirectory()) {
      console.log(prefix + entry.name + '/');
      listFiles(path.join(dir, entry.name), prefix + '  ');
    } else {
      console.log(prefix + entry.name);
    }
  });
}

console.log('Files in src folder and subfolders:');
listFiles(rootDir);
