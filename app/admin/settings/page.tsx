
// Use 'use client' to be able to use the useSearchParams hook for reading URL errors
'use client';

import { useSearchParams } from 'next/navigation';

// A small component to display success or error messages from the server
function FormMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  if (error) {
    return <p className="text-red-500 text-sm mb-4">{error}</p>;
  }
  if (success) {
    return <p className="text-green-500 text-sm mb-4">{success}</p>;
  }
  return null;
}

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Thay đổi mật khẩu Admin</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md dark:bg-gray-800">
        {/* This form posts directly to our new API route */}
        <form action="/api/admin/change-password" method="POST">
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="currentPassword">
              Mật khẩu hiện tại
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="newPassword">
              Mật khẩu mới
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="confirmPassword">
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <FormMessage />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}
