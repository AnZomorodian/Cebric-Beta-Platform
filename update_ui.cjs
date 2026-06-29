const fs = require('fs');

let content = fs.readFileSync('src/components/ClubManagerTab.tsx', 'utf8');

// I need to add a small component at the top of the file or just inside the file to render a driver card.
// Wait, I can just replace the JSX for Seat 1, Seat 2, and Seat 3.

const renderDriverCardSrc = `
  const renderDriverCard = (driver: any, seatNumber: 1 | 2 | 3, seatTitle: string, badgeColor: string) => {
    if (!driver) {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className={\`absolute top-0 right-0 \${badgeColor} text-white font-black font-mono text-xs px-3 py-1 rounded-bl-xl uppercase\`}>
            Seat #\${seatNumber} (\${seatTitle})
          </div>
          <div className="space-y-2 pt-2">
            <h4 className="text-2xl font-black text-gray-900">Empty Seat</h4>
            <p className="text-xs text-gray-500">Sign a driver from the market.</p>
          </div>
        </div>
      );
    }

    const radarData = [
      { subject: 'Speed', A: driver.speed || driver.skill || 70, fullMark: 100 },
      { subject: 'Defense', A: driver.defense || driver.skill || 70, fullMark: 100 },
      { subject: 'Experience', A: driver.experience || driver.skill || 50, fullMark: 100 },
      { subject: 'Aggression', A: driver.aggression || driver.skill || 70, fullMark: 100 },
      { subject: 'Consistency', A: driver.consistency || driver.skill || 70, fullMark: 100 },
    ];

    return (
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4 text-white">
        <div className={\`absolute top-0 right-0 \${badgeColor} text-white font-black font-mono text-[10px] px-3 py-1 rounded-bl-xl uppercase\`}>
          Seat #\${seatNumber} (\${seatTitle})
        </div>
        
        <div className="flex justify-between items-start pt-2">
          <div>
            <h4 className="text-2xl font-black">{driver.name}</h4>
            <div className="text-xs text-neutral-400 font-mono mt-1">
              {driver.nationality} • Age {driver.age || 25}
            </div>
          </div>
          <div className="bg-transparent border border-cyan-400 text-cyan-400 px-3 py-2 rounded-lg font-black text-xl flex flex-col items-center">
            {driver.skill}
            <span className="text-[8px] uppercase tracking-wider text-cyan-500">Overall</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Attributes List */}
          <div className="space-y-3">
            {[
              { label: 'Speed', key: 'speed', icon: '⚡' },
              { label: 'Defense', key: 'defense', icon: '🛡️' },
              { label: 'Consistency', key: 'consistency', icon: '🎯' },
              { label: 'Aggression', key: 'aggression', icon: '📈' },
              { label: 'Experience', key: 'experience', icon: '📖' },
            ].map(attr => {
              const val = driver[attr.key] || driver.skill || 70;
              return (
                <div key={attr.key} className="flex items-center justify-between text-xs font-mono group">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="w-4 text-center">{attr.icon}</span>
                    <span className="w-20">{attr.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold w-6 text-right">{val}</span>
                    <button onClick={() => handleTrainDriver(seatNumber, attr.key)} className="opacity-0 group-hover:opacity-100 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded text-[9px] transition-all" title={\`Train \${attr.label} (-$50k)\`}>Train</button>
                    <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: \`\${val}%\` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Radar Chart */}
          <div className="h-40 relative flex items-center justify-center bg-neutral-950/50 rounded-xl">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 9 }} />
                <Radar name={driver.name} dataKey="A" stroke="#00f2fe" fill="#4facfe" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center gap-2">
          <button onClick={() => handleDriverInteract(seatNumber, 'praise')} title="Praise" className="p-1.5 bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 rounded transition"><ThumbsUp size={16} /></button>
          <button onClick={() => handleDriverInteract(seatNumber, 'criticize')} title="Criticize" className="p-1.5 bg-orange-900/30 hover:bg-orange-800/50 text-orange-400 rounded transition"><ThumbsDown size={16} /></button>
          <button onClick={() => handleDriverInteract(seatNumber, 'bonus')} title="Bonus (-$50k)" className="p-1.5 bg-yellow-900/30 hover:bg-yellow-800/50 text-yellow-400 rounded transition"><Coins size={16} /></button>
          <div className="w-px h-4 bg-neutral-700 mx-1"></div>
          <button onClick={() => handleUpdateDriverStyle(seatNumber, 'Aggressive')} title="Aggressive" className={\`p-1.5 rounded transition \${driver.drivingStyle === 'Aggressive' ? 'bg-red-500 text-white' : 'bg-red-900/30 hover:bg-red-800/50 text-red-400'}\`}><Zap size={16} /></button>
          <button onClick={() => handleUpdateDriverStyle(seatNumber, 'Balanced')} title="Balanced" className={\`p-1.5 rounded transition \${driver.drivingStyle === 'Balanced' || !driver.drivingStyle ? 'bg-neutral-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'}\`}><Scale size={16} /></button>
          <button onClick={() => handleUpdateDriverStyle(seatNumber, 'Conservative')} title="Conservative" className={\`p-1.5 rounded transition \${driver.drivingStyle === 'Conservative' ? 'bg-blue-500 text-white' : 'bg-blue-900/30 hover:bg-blue-800/50 text-blue-400'}\`}><Shield size={16} /></button>
        </div>

        <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-xs text-neutral-400 font-mono">
            Salary: <strong className="text-white">\${(driver.salary || 0).toLocaleString()}</strong><br/>
            Release Clause: <strong className="text-white">\${(driver.price || 0).toLocaleString()}</strong>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleTrainDriver(seatNumber, 'skill')}
              className="px-3 py-2 rounded-xl bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-400 border border-cyan-900/50 text-[10px] font-bold transition-colors uppercase tracking-wider"
            >
              Train OVR (-$50k)
            </button>
            <button
              onClick={() => handleSellDriver(seatNumber)}
              className="px-3 py-2 rounded-xl bg-red-900/30 hover:bg-red-800/50 text-red-400 border border-red-900/50 text-[10px] font-bold transition-colors uppercase tracking-wider"
            >
              Sell Driver
            </button>
          </div>
        </div>
      </div>
    );
  };
`;


// Let's replace the handleTrainDriver signature first
content = content.replace(/const handleTrainDriver = async \(slot: 1 \| 2\) => \{/g, 'const handleTrainDriver = async (slot: 1 | 2 | 3, attribute?: string) => {');
content = content.replace(/body: JSON.stringify\(\{ username: currentUser.username, slot \}\)/g, 'body: JSON.stringify({ username: currentUser.username, slot, attribute })');

// Now inject renderDriverCard right before the return statement inside ClubManagerTab
content = content.replace(/  if \(isLoading\) \{/, renderDriverCardSrc + '\n  if (isLoading) {');

// Now replace the Seat 1, 2, and 3 UI
const seatsRegex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?\{myClubRecord\.testDriver && \([\s\S]*?Sell \(80%\)[\s\S]*?<\/button>[\s\S]*?\)\}[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/;

const newSeatsRender = `<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {renderDriverCard(myClubRecord.driver1, 1, "Lead Driver", "bg-red-600")}
                  {renderDriverCard(myClubRecord.driver2, 2, "Wingman", "bg-gray-800")}
                  {renderDriverCard(myClubRecord.testDriver, 3, "Test Driver", "bg-blue-600")}
                </div>
              </div>`;

content = content.replace(seatsRegex, newSeatsRender);

fs.writeFileSync('src/components/ClubManagerTab.tsx', content, 'utf8');
console.log('done updating UI');
