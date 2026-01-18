import { createContext, useContext } from 'react';

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  // Fallback to a no-op socket implementation in tests or when no provider is set
  return (
    socket || {
      on: () => {},
      off: () => {},
      emit: () => {},
      disconnect: () => {}
    }
  );
};

export const SocketProvider = ({ socket, children }) => (
  <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
);
