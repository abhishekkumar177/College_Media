import { createContext, useReducer, useContext, useMemo } from "react";
import { postsReducer, initialPostsState } from "../reducers/postsReducer";
import { POSTS_ACTIONS } from "../reducers/actionTypes";

// 1. Split Contexts for performance
const PostsStateContext = createContext(null);
const PostsDispatchContext = createContext(null);

export const PostsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(postsReducer, initialPostsState);

  // We memoize the dispatch context so it never changes, 
  // preventing re-renders of "action-only" components.
  return (
    <PostsStateContext.Provider value={state}>
      <PostsDispatchContext.Provider value={dispatch}>
        {children}
      </PostsDispatchContext.Provider>
    </PostsStateContext.Provider>
  );
};

// 2. Custom Hooks for cleaner consumption
export const usePostsState = () => {
  const context = useContext(PostsStateContext);
  if (!context) throw new Error("usePostsState must be used within a PostsProvider");
  return context;
};

export const usePostsActions = () => {
  const dispatch = useContext(PostsDispatchContext);
  if (!dispatch) throw new Error("usePostsActions must be used within a PostsProvider");

  // 3. Centralized Action Wrappers (Memoized)
  return useMemo(() => ({
    fetchPosts: {
      start: () => dispatch({ type: POSTS_ACTIONS.FETCH_POSTS_START }),
      success: (posts, pagination) => dispatch({ type: POSTS_ACTIONS.FETCH_POSTS_SUCCESS, payload: { posts, pagination } }),
      failure: (error) => dispatch({ type: POSTS_ACTIONS.FETCH_POSTS_FAILURE, payload: error }),
    },
    postOps: {
      create: (post) => dispatch({ type: POSTS_ACTIONS.CREATE_POST_SUCCESS, payload: post }),
      update: (post) => dispatch({ type: POSTS_ACTIONS.UPDATE_POST_SUCCESS, payload: post }),
      delete: (postId) => dispatch({ type: POSTS_ACTIONS.DELETE_POST_SUCCESS, payload: postId }),
      like: (postId) => dispatch({ type: POSTS_ACTIONS.LIKE_POST, payload: { postId } }),
    },
    setFilter: (filters) => dispatch({ type: POSTS_ACTIONS.SET_FILTER, payload: filters }),
    // ... add other condensed actions here
  }), [dispatch]);
};