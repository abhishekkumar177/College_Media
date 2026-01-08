import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const MessagesLayout = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Outlet />
    </div>
  );
};

export default MessagesLayout;
