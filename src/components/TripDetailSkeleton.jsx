export default function TripDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 md:py-10 md:px-8 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/90 rounded-2xl shadow-lg border border-white/20 overflow-hidden animate-pulse">
            <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-24 md:h-28 rounded-t-2xl" />
            <div className="p-4 md:p-6 space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex gap-4">
                  <div className="w-20 h-5 bg-gray-200 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
