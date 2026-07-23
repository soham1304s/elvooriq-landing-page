const FormData = require('form-data');
const fs = require('fs');

async function test() {
  const form = new FormData();
  form.append('name', 'Test User');
  form.append('handle', '@test');
  form.append('followers', '1M');
  form.append('image', fs.createReadStream('tiny.png'));

  try {
    const fetch = (await import('node-fetch')).default || global.fetch;
    const res = await fetch('http://localhost:5000/api/creators', {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    console.log(res.status, data);
  } catch (err) {
    console.error(err);
  }
}
test();
