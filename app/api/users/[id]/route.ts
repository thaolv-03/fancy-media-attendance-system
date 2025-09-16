
import { NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/lib/database';
import { z } from 'zod';

// GET handler for a single user
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 });
        }

        const user = getUserById(id);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: user });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[API] Failed to get user ${params.id}:`, errorMessage);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: errorMessage }), { status: 500 });
    }
}

// Validation schema for PATCH request
const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  qrCode: z.string().min(1, "QR code is required").optional(),
}).strict("Unknown fields are not allowed.");


// PATCH handler for updating a user
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 });
        }

        // Check if user exists before attempting to update
        const userExists = getUserById(id);
        if (!userExists) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        
        const validation = updateUserSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ success: false, message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { name, qrCode } = validation.data;

        if (!name && !qrCode) {
            return NextResponse.json({ success: false, message: 'Nothing to update. Provide name or qrCode.' }, { status: 400 });
        }

        const result = updateUser(id, { name, qrCode });
        
        if (result.changes === 0) {
             // This can happen if the data is the same, but we can still return success.
             // For a more strict approach, you could query the user again and compare.
            return NextResponse.json({ success: true, message: 'User data is already up to date.' });
        }

        return NextResponse.json({ success: true, message: 'User updated successfully' });

    } catch (error) {
         // Handle potential unique constraint errors (e.g., qrCode or name already exists)
        if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
            return NextResponse.json({ success: false, message: 'Failed to update: Name or QR code already exists for another user.' }, { status: 409 });
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[API] Failed to update user ${params.id}:`, errorMessage);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: errorMessage }), { status: 500 });
    }
}


// DELETE handler for removing a user
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 });
        }

        // Check if user exists before attempting deletion
        const userExists = getUserById(id);
        if (!userExists) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const result = deleteUser(id);

        if (result.changes === 0) {
            // This case should ideally not be hit if userExists check passes, but is kept for safety
            return NextResponse.json({ success: false, message: 'User could not be deleted' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'User and their attendance records deleted successfully' });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[API] Failed to delete user ${params.id}:`, errorMessage);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: errorMessage }), { status: 500 });
    }
}
