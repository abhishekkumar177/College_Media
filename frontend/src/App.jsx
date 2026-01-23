import React from 'react';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Feed from './components/Feed/Feed';
import Widgets from './components/Widgets/Widgets';
import { AuthProvider } from './context/AuthContext';
import { PostsProvider } from './context/PostsContext';

export default function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <div className="bg-[#f3f2ef] min-h-screen">
          <Header />
          <main className="flex justify-center py-6 px-4">
            <div className="flex w-full max-w-7xl">
              <Sidebar />
              <Feed />
              <Widgets />
            </div>
          </main>
        </div>
      </PostsProvider>
    </AuthProvider>
  );
}