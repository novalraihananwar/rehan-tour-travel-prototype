export default function ItineraryLoading() {
  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-3xl mx-auto animate-pulse">
        {/* Print button placeholder */}
        <div className="flex justify-end mb-6">
          <div className="h-10 w-36 rounded-xl bg-stone-200" />
        </div>

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-stone-900 px-8 py-8 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-stone-700" />
              <div className="h-6 w-48 rounded bg-stone-700" />
              <div className="h-3 w-36 rounded bg-stone-800" />
            </div>
            <div className="space-y-2 text-right">
              <div className="h-3 w-20 rounded bg-stone-700 ml-auto" />
              <div className="h-7 w-28 rounded bg-stone-700 ml-auto" />
            </div>
          </div>

          {/* Summary skeleton */}
          <div className="px-8 py-6 border-b border-stone-100">
            <div className="h-3 w-28 rounded bg-stone-200 mb-4" />
            <div className="grid grid-cols-3 gap-x-8 gap-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="h-2.5 w-16 rounded bg-stone-200 mb-1.5" />
                  <div className="h-4 w-32 rounded bg-stone-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Itinerary skeleton */}
          <div className="px-8 py-6 border-b border-stone-100">
            <div className="h-3 w-40 rounded bg-stone-200 mb-5" />
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-200 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-56 rounded bg-stone-200" />
                    <div className="h-3 w-full rounded bg-stone-100" />
                    <div className="h-3 w-4/5 rounded bg-stone-100" />
                    <div className="space-y-1 mt-3">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="h-3 w-3/4 rounded bg-stone-100" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips skeleton */}
          <div className="px-8 py-6 border-b border-stone-100">
            <div className="h-3 w-24 rounded bg-stone-200 mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-stone-100" />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-stone-900 px-8 py-4">
            <div className="h-3 w-64 rounded bg-stone-700" />
          </div>
        </div>
      </div>
    </div>
  )
}
