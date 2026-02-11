const fs = require('fs');
const path = require('path');

// Configuration
const COUNT = 100; // Number of codes to generate
const PREFIX = 'CAT';
const LENGTH = 8; // Length of the random part

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0 to avoid confusion
  let result = '';
  for (let i = 0; i < LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Format: CAT-XXXX-XXXX
  return `${PREFIX}-${result.substring(0, 4)}-${result.substring(4, 8)}`;
}

function generateBatch() {
  const codes = new Set();
  
  while (codes.size < COUNT) {
    codes.add(generateCode());
  }

  const codeList = Array.from(codes);
  const outputPath = path.join(__dirname, 'codes.txt');
  
  fs.writeFileSync(outputPath, codeList.join('\n'));
  
  console.log(`✅ Successfully generated ${codeList.length} unique codes.`);
  console.log(`📂 Saved to: ${outputPath}`);
  console.log('--- Sample Codes ---');
  console.log(codeList.slice(0, 5).join('\n'));
  console.log('...');
}

generateBatch();
