const res = await fetch('http://localhost:5000/api/health');
console.log('Status:', res.status);
const data = await res.json();
console.log('Response:', JSON.stringify(data, null, 2));
