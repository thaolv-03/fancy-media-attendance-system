
// Use 'use client' to be able to use the useSearchParams hook
'use client';

import { useSearchParams } from 'next/navigation';

// This component now only displays the form and any errors passed in the URL.
function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (!error) return null;

  return <p className="text-red-500 text-sm mb-4">{error}</p>;
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h1>
        {/* The form now submits directly to the API route */}
        <form action="/api/auth/login" method="POST">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="username">
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username" // Name attribute is required for form submission
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password" // Name attribute is required for form submission
              type="password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          {/* Display error messages from URL search params */}
          <ErrorMessage />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}
