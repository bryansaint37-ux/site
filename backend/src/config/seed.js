require('dotenv').config();
const { pool } = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Admin user
    const adminId = uuidv4();
    const passwordHash = await bcrypt.hash('Admin@123456', 12);
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_verified)
      VALUES ($1, $2, $3, 'Super', 'Admin', 'super_admin', true)
      ON CONFLICT (email) DO NOTHING
    `, [adminId, 'admin@worldcuptickets.com', passwordHash]);

    // Stadiums
    const stadiums = [
      { id: uuidv4(), name: 'Grand Stadium', city: 'Metropolis', country: 'Host Country', capacity: 80000 },
      { id: uuidv4(), name: 'City Arena', city: 'Capital City', country: 'Host Country', capacity: 60000 },
      { id: uuidv4(), name: 'National Bowl', city: 'Eastport', country: 'Host Country', capacity: 50000 },
    ];
    for (const s of stadiums) {
      await client.query(
        'INSERT INTO stadiums (id, name, city, country, capacity) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
        [s.id, s.name, s.city, s.country, s.capacity]
      );
    }

    // Teams
    const teams = [
      { id: uuidv4(), name: 'Brazil', country_code: 'BRA', group_name: 'A' },
      { id: uuidv4(), name: 'Argentina', country_code: 'ARG', group_name: 'A' },
      { id: uuidv4(), name: 'France', country_code: 'FRA', group_name: 'B' },
      { id: uuidv4(), name: 'Germany', country_code: 'GER', group_name: 'B' },
      { id: uuidv4(), name: 'Spain', country_code: 'ESP', group_name: 'C' },
      { id: uuidv4(), name: 'Portugal', country_code: 'POR', group_name: 'C' },
      { id: uuidv4(), name: 'England', country_code: 'ENG', group_name: 'D' },
      { id: uuidv4(), name: 'Italy', country_code: 'ITA', group_name: 'D' },
    ];
    for (const t of teams) {
      await client.query(
        'INSERT INTO teams (id, name, country_code, group_name) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',
        [t.id, t.name, t.country_code, t.group_name]
      );
    }

    // Matches
    const now = new Date();
    const matchData = [
      { home: 0, away: 1, stadium: 0, days: 1, stage: 'group', group_name: 'A' },
      { home: 2, away: 3, stadium: 1, days: 2, stage: 'group', group_name: 'B' },
      { home: 4, away: 5, stadium: 2, days: 3, stage: 'group', group_name: 'C' },
      { home: 6, away: 7, stadium: 0, days: 4, stage: 'group', group_name: 'D' },
    ];

    for (let i = 0; i < matchData.length; i++) {
      const m = matchData[i];
      const matchId = uuidv4();
      const matchDate = new Date(now.getTime() + m.days * 24 * 60 * 60 * 1000);
      await client.query(
        `INSERT INTO matches (id, home_team_id, away_team_id, stadium_id, match_date, stage, group_name, match_number, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'scheduled') ON CONFLICT DO NOTHING`,
        [matchId, teams[m.home].id, teams[m.away].id, stadiums[m.stadium].id, matchDate, m.stage, m.group_name, i + 1]
      );

      // Ticket categories for each match
      const categories = [
        { name: 'Category 1', description: 'Premium behind goal', price: 150, total: 500, section: 'A' },
        { name: 'Category 2', description: 'Mid-range side stands', price: 250, total: 300, section: 'B' },
        { name: 'Category 3', description: 'Premium side stands', price: 450, total: 200, section: 'C' },
        { name: 'Hospitality', description: 'VIP hospitality experience', price: 1200, total: 50, section: 'VIP' },
      ];
      for (const cat of categories) {
        await client.query(
          `INSERT INTO ticket_categories (id, match_id, name, description, price, total_seats, available_seats, section)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [uuidv4(), matchId, cat.name, cat.description, cat.price, cat.total, cat.total, cat.section]
        );
      }
    }

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully');
    console.log('Admin: admin@worldcuptickets.com / Admin@123456');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
};

seed();
