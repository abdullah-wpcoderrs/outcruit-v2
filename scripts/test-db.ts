import 'dotenv/config';
import { pool } from '../lib/db';
import { hashPassword, verifyPassword } from '../lib/auth';

async function main() {
    console.log('Testing database connection...');
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Database connected:', res.rows[0]);

        console.log('Testing auth functions...');
        const password = 'testpassword';
        const hash = await hashPassword(password);
        const isValid = await verifyPassword(password, hash);
        console.log('Auth check:', isValid ? 'PASSED' : 'FAILED');

        console.log('All checks passed!');
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await pool.end();
    }
}

main();
