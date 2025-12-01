const fs = require('fs');

const sakks = JSON.parse(fs.readFileSync('./sakks.json', 'utf-8'));

const nums = sakks.map((s) => s['الصك'].toString().trim());

const unique = new Set(nums);

console.log('عدد الصكوك:', nums.length);
console.log('عدد الصكوك الفريدة:', unique.size);
