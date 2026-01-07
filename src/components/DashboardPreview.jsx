const DashboardPreview = () => {
  return (
    <div className="w-full h-[500px] bg-white rounded-xl flex overflow-hidden text-sm">
      {/* Left Sidebar */}
      <div className="w-1/5 bg-slate-50 p-4">
        <div className="mb-4 font-semibold text-purple-600">🏠 Feed</div>
        <div className="mb-3 text-slate-600">👥 Classmates</div>
        <div className="mb-3 text-slate-600">🔔 Notifications</div>

        <div className="mt-6 text-xs text-slate-400">TRENDING</div>
        <div className="mt-2 text-slate-500">#FinalsWeek</div>
        <div className="mt-1 text-slate-500">#CampusFest</div>
      </div>

      {/* Feed */}
      <div className="w-3/5 p-6 bg-slate-50">
        <div className="flex gap-4 mb-6">
          <div className="w-14 h-14 rounded-full border-2 border-purple-400" />
          <div className="w-14 h-14 rounded-full border-2 border-pink-400" />
          <div className="w-14 h-14 rounded-full border-2 border-slate-300" />
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <div className="text-slate-400">
            What's happening on campus?
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <div className="font-medium text-slate-800">John Doe</div>
          <div className="text-xs text-slate-400 mb-2">
            Computer Science • 2h ago
          </div>
          <div className="text-slate-600">
            Just finished the hackathon project! 🚀
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/5 bg-slate-50 p-4">
        <div className="text-xs font-semibold text-slate-400 mb-3">
          ONLINE CLASSMATES
        </div>

        <div className="mb-3 text-slate-600">🟢 Emily Chen</div>
        <div className="text-slate-600">🟢 Marcus J.</div>
      </div>
    </div>
  );
};

export default DashboardPreview;
