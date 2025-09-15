
import { NextResponse } from 'next/server';
import { db, getUsers, getAttendanceRecords } from '@/lib/database';

// Helper function to get today's date range in YYYY-MM-DD HH:MM:SS format
const getTodayDateRangeISO = () => {
    const now = new Date();
    // Set time to beginning of the day in the local timezone
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    // Set time to end of the day in the local timezone
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Function to convert a local date to a UTC-based ISO string suitable for SQLite
    const toSQLiteFormat = (date: Date) => {
        // Create a new date object with the same time value but interpreted as UTC
        const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return utcDate.toISOString().slice(0, 19).replace('T', ' ');
    }

    return {
        start: toSQLiteFormat(startOfToday),
        end: toSQLiteFormat(endOfToday)
    };
};

export async function GET() {
    try {
        // 1. Get Total Employees
        const users = getUsers();
        const totalEmployees = users.length;

        // 2. Get Today's Attendance Stats
        const { start, end } = getTodayDateRangeISO();

        const todayCheckinStmt = db.prepare(`
            SELECT 
                status,
                check_type
            FROM attendance
            WHERE timestamp BETWEEN ? AND ?
              AND check_type = 'Check-in'
        `);
        const todayCheckins = todayCheckinStmt.all(start, end) as { status: string; check_type: string }[];

        const checkInsTodayCount = todayCheckins.length;
        const lateTodayCount = todayCheckins.filter(a => a.status === 'Đi muộn').length;
        const onTimeCheckins = checkInsTodayCount - lateTodayCount;

        // 3. Get Recent Activity (limited to 5)
        const recentActivityRaw = getAttendanceRecords(5) as {
            user_name: string;
            timestamp: string;
            check_type: string;
            status: string;
        }[];

        const recentActivity = recentActivityRaw.map(activity => ({
            name: activity.user_name,
            timestamp: activity.timestamp, // Return the full timestamp
            status: activity.check_type, // 'Check-in' or 'Check-out'
            type: activity.status // 'Đúng giờ', 'Đi muộn', 'Về sớm'
        }));

        // 4. Assemble the final stats object
        const stats = {
            totalEmployees,
            totalEmployeesFromLastMonth: 2, // Dummy data as we don't store historical employee counts
            checkInsToday: `${checkInsTodayCount}/${totalEmployees}`,
            checkInsTodayPercentage: totalEmployees > 0 ? Math.round((checkInsTodayCount / totalEmployees) * 100) : 0,
            onTimePercentage: checkInsTodayCount > 0 ? Math.round((onTimeCheckins / checkInsTodayCount) * 100) : 100,
            onTimePercentageChange: 5, // Dummy data
            lateTodayCount,
            recentActivity,
        };

        return NextResponse.json(stats);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('[API STATS] Failed to fetch admin stats:', errorMessage);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
