const { query } = require('../config/database');
const { createError } = require('../middleware/errorHandler');

const getMatches = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20,
      stage, group_name, status,
      team, stadium_id,
      date_from, date_to,
      search,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];

    if (stage) { params.push(stage); conditions.push(`m.stage = $${params.length}`); }
    if (group_name) { params.push(group_name.toUpperCase()); conditions.push(`m.group_name = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`m.status = $${params.length}`); }
    if (stadium_id) { params.push(stadium_id); conditions.push(`m.stadium_id = $${params.length}`); }
    if (date_from) { params.push(date_from); conditions.push(`m.match_date >= $${params.length}`); }
    if (date_to) { params.push(date_to); conditions.push(`m.match_date <= $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(ht.name ILIKE $${params.length} OR at.name ILIKE $${params.length} OR s.name ILIKE $${params.length})`);
    }
    if (team) {
      params.push(`%${team}%`);
      conditions.push(`(ht.name ILIKE $${params.length} OR at.name ILIKE $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(`
      SELECT COUNT(*) FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN stadiums s ON m.stadium_id = s.id
      ${whereClause}
    `, params);

    params.push(parseInt(limit), offset);
    const matchesResult = await query(`
      SELECT
        m.id, m.match_date, m.stage, m.group_name, m.match_number, m.status,
        json_build_object('id', ht.id, 'name', ht.name, 'country_code', ht.country_code, 'flag_url', ht.flag_url) AS home_team,
        json_build_object('id', at.id, 'name', at.name, 'country_code', at.country_code, 'flag_url', at.flag_url) AS away_team,
        json_build_object('id', s.id, 'name', s.name, 'city', s.city, 'country', s.country, 'capacity', s.capacity) AS stadium,
        COALESCE(json_agg(
          json_build_object('id', tc.id, 'name', tc.name, 'price', tc.price, 'available_seats', tc.available_seats, 'total_seats', tc.total_seats, 'section', tc.section)
          ORDER BY tc.price
        ) FILTER (WHERE tc.id IS NOT NULL), '[]') AS ticket_categories
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN stadiums s ON m.stadium_id = s.id
      LEFT JOIN ticket_categories tc ON m.id = tc.match_id
      ${whereClause}
      GROUP BY m.id, ht.id, at.id, s.id
      ORDER BY m.match_date ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const total = parseInt(countResult.rows[0].count);
    res.json({
      success: true,
      data: matchesResult.rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

const getMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await query(`
      SELECT
        m.id, m.match_date, m.stage, m.group_name, m.match_number, m.status,
        json_build_object('id', ht.id, 'name', ht.name, 'country_code', ht.country_code, 'flag_url', ht.flag_url) AS home_team,
        json_build_object('id', at.id, 'name', at.name, 'country_code', at.country_code, 'flag_url', at.flag_url) AS away_team,
        json_build_object('id', s.id, 'name', s.name, 'city', s.city, 'country', s.country, 'capacity', s.capacity, 'image_url', s.image_url) AS stadium,
        COALESCE(json_agg(
          json_build_object('id', tc.id, 'name', tc.name, 'description', tc.description, 'price', tc.price, 'available_seats', tc.available_seats, 'total_seats', tc.total_seats, 'section', tc.section, 'benefits', tc.benefits)
          ORDER BY tc.price
        ) FILTER (WHERE tc.id IS NOT NULL), '[]') AS ticket_categories
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN stadiums s ON m.stadium_id = s.id
      LEFT JOIN ticket_categories tc ON m.id = tc.match_id
      WHERE m.id = $1
      GROUP BY m.id, ht.id, at.id, s.id
    `, [id]);

    if (!rows[0]) throw createError('Match not found', 404);
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getMatches, getMatch };
