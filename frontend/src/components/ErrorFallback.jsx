import { useNavigate } from "react-router-dom";

export default function ErrorFallback() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-sm w-full text-center">
        <p className="text-gray-700 font-medium mb-2">Something went wrong.</p>
        <p className="text-gray-500 text-sm mb-6">Please refresh the page or return to the dashboard.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
