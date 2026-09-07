const fs = require('fs');
const path = require('path');

const files = [
  'components/LiveSquadChat.tsx',
  'components/RootAdminPanel.tsx',
  'components/DeployGuide.tsx',
  'components/VoiceRoomPanel.tsx'
];

for (const file of files) {
  try {
    const fullPath = path.join(__dirname, file);
    const content = fs.readFileSync(fullPath);
    // Determine encoding. If it has UTF-16 LE BOM (FF FE) or BE BOM (FE FF), read accordingly.
    // PowerShell Set-Content without -Encoding usually writes UTF-16 LE (also known as UCS-2 LE).
    let text = '';
    if (content[0] === 0xFF && content[1] === 0xFE) {
      text = content.toString('utf16le');
    } else {
      text = content.toString('utf8');
    }
    
    // In case it was written as windows-1252 or similar and corrupted, this might not fully fix it,
    // but Node's 'utf16le' usually correctly reads PowerShell's Set-Content output.
    
    fs.writeFileSync(fullPath, text, 'utf8');
    console.log(`Fixed encoding for ${file}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
}
