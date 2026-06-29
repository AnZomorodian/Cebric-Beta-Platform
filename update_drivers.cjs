const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

// 1. Update generateMarketDrivers
const newGenMarketDrivers = `function generateMarketDrivers(count: number = 18) {
  return Array.from({ length: count }).map((_, i) => {
    const skill = Math.floor(Math.random() * 20) + 60; // 60-80
    const age = Math.floor(Math.random() * 12) + 18; // 18-30
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return {
      id: \`drv_m_\${Date.now()}_\${i}_\${Math.floor(Math.random()*1000)}\`,
      name: \`\${fName} \${lName}\`,
      skill,
      speed: skill + Math.floor(Math.random() * 10 - 5),
      defense: skill + Math.floor(Math.random() * 10 - 5),
      consistency: skill + Math.floor(Math.random() * 10 - 5),
      aggression: skill + Math.floor(Math.random() * 14 - 7),
      experience: Math.max(10, Math.floor(age * 2) + Math.floor(Math.random() * 20 - 10)),
      price: skill * 5000,
      salary: skill * 500,
      age,
      nationality: nations[Math.floor(Math.random() * nations.length)],
      morale: 80,
      focus: 80,
      loyalty: 80
    };
  });
}`;

server = server.replace(/function generateMarketDrivers[\s\S]*?\}\n\}/, newGenMarketDrivers);

// 2. Update new club creation
const newClubDriver1Str = `driver1: { id: \`drv_rk1_\${Date.now()}\`, name: getRandomName(), skill: Math.floor(Math.random() * 11) + 65, price: 50000, salary: 6500, speed: 70, defense: 68, consistency: 72, aggression: 65, experience: 40 },
        driver2: { id: \`drv_rk2_\${Date.now()}\`, name: getRandomName(), skill: Math.floor(Math.random() * 11) + 65, price: 40000, salary: 5500, speed: 65, defense: 65, consistency: 68, aggression: 70, experience: 35 },`;

server = server.replace(/driver1: \{ id: `drv_rk1_\$\{Date.now\(\)\}`, name: getRandomName\(\), skill: Math.floor\(Math.random\(\) \* 11\) \+ 65, price: 50000, salary: 6500 \},\n\s+driver2: \{ id: `drv_rk2_\$\{Date.now\(\)\}`, name: getRandomName\(\), skill: Math.floor\(Math.random\(\) \* 11\) \+ 65, price: 40000, salary: 5500 \},/, newClubDriver1Str);

// 3. Update scout wonderkid
const newScoutDriverStr = `const wonderkid = {
      id: \`drv_scout_\${Date.now()}\`,
      name: \`\${fn} \${ln}\`,
      skill,
      speed: skill + Math.floor(Math.random() * 8),
      defense: skill + Math.floor(Math.random() * 5 - 2),
      consistency: skill + Math.floor(Math.random() * 10 - 5),
      aggression: skill + Math.floor(Math.random() * 10),
      experience: Math.floor(age * 1.5),
      price,
      salary,
      age,
      nationality: nat,
      isWonderkid: true
    };`;
server = server.replace(/const wonderkid = \{\n\s+id: `drv_scout_\$\{Date.now\(\)\}`,\n\s+name: `\$\{fn\} \$\{ln\}`,\n\s+skill,\n\s+price,\n\s+salary,\n\s+age,\n\s+nationality: nat,\n\s+isWonderkid: true\n\s+\};/, newScoutDriverStr);

fs.writeFileSync('server.ts', server, 'utf8');
console.log('updated server');
