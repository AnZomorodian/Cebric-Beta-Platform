import http from 'http';
http.get('http://localhost:3000/api/prediction-settings', (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Data:', data.substring(0, 50)));
}).on('error', err => console.log('Error:', err.message));
