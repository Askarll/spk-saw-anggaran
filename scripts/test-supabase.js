const fs = require('fs');
(async () => {
  try {
    const envRaw = fs.readFileSync('.env', 'utf8');
    const env = {};
    envRaw.split(/\r?\n/).forEach((line) => {
      const i = line.indexOf('=');
      if (i > 0) {
        const k = line.slice(0, i).trim();
        const v = line.slice(i + 1).trim().replace(/^"|"$/g, '');
        env[k] = v;
      }
    });

    const url = env.VITE_SUPABASE_URL;
    const key = env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
      process.exit(2);
    }

    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/kriteria?select=*`;
    const body = [
      { kode_kriteria: 'TST', nama_kriteria: 'Test Insert', bobot: 0.1, atribut: 'benefit' },
    ];

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + key,
        apikey: key,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log('STATUS', res.status);
    console.log(text);
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  }
})();
