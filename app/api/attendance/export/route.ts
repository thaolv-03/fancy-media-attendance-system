import { NextResponse } from 'next/server';
import { getAttendanceRecords } from '@/lib/database';
import ExcelJS from 'exceljs';
import type { AttendanceRecord } from '@/lib/types';

export async function GET() {
    try {
        // 1. Fetch all attendance records
        const allRecords: AttendanceRecord[] = getAttendanceRecords(10000);

        if (!allRecords || allRecords.length === 0) {
            return new NextResponse(JSON.stringify({ message: 'No attendance data to export' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Create a new workbook and a worksheet with ExcelJS
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Your App Name';
        workbook.lastModifiedBy = 'Your App Name';
        workbook.created = new Date();
        workbook.modified = new Date();

        const worksheet = workbook.addWorksheet('BaoCaoChamCong', {
            views: [{ state: 'frozen', ySplit: 1 }] // Freeze the header row
        });

        // 3. Define columns and add header row
        worksheet.columns = [
            { header: 'ID Bản Ghi', key: 'id', width: 15 },
            { header: 'Tên Nhân Viên', key: 'user_name', width: 30 },
            { header: 'ID Nhân Viên', key: 'user_id', width: 15 },
            { header: 'Thời Gian', key: 'timestamp', width: 25, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
            { header: 'Loại', key: 'check_type', width: 15 },
            { header: 'Trạng Thái', key: 'status', width: 15 },
            { header: 'Phương Thức', key: 'method', width: 20 },
        ];

        // Style the header row
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF444444' } // Dark Gray background
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // 4. Add data rows
        allRecords.forEach((record) => {
            // IMPORTANT: Parse timestamp string as UTC by adding 'Z' 
            const utcDate = new Date(record.timestamp + 'Z');

            worksheet.addRow({
                id: record.id,
                user_name: record.user_name,
                user_id: record.user_id,
                timestamp: utcDate, // Add the Date object directly
                check_type: record.check_type,
                status: record.status,
                method: record.method === 'FaceID-WebRTC' ? 'Face ID' : record.method,
            });
        });

        // Style data rows (optional: for borders, alignment etc.)
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) { // Skip header
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            }
        });

        // 5. Generate a buffer from the workbook
        const buffer = await workbook.xlsx.writeBuffer();

        // 6. Create response with correct headers for file download
        const headers = new Headers();
        headers.append('Content-Disposition', `attachment; filename="BaoCaoChamCong_${new Date().toISOString().slice(0, 10)}.xlsx"`);
        headers.append('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        return new NextResponse(buffer, { status: 200, headers });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('[API EXPORT] Failed to export attendance data:', errorMessage);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}