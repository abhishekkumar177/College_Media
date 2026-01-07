import Navbar from "./Navbar";
import LeftSidebar from "./LeftSidebar";

const PageLayout = ({ children, searchQuery, setSearchQuery, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="ml-64">
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
