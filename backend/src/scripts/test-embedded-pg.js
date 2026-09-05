const EmbeddedPostgres = require('embedded-postgres').default || require('embedded-postgres');
const path = require('path');

async function main() {
  console.log('🚀 Initializing user-space local PostgreSQL instance...');
  const pg = new EmbeddedPostgres({
    port: 5432,
    databaseDir: path.join(__dirname, '../../.pgdata'),
    user: 'postgres',
    password: 'postgres',
    initialDatabase: 'elvooriq_db',
    persistent: true
  });

  try {
    await pg.initialise();
    await pg.start();
    console.log('✅ Local PostgreSQL server started successfully on localhost:5432!');
  } catch (error) {
    console.log('⚠️ Notice during PostgreSQL startup:', error.message);
  }
}

main();
