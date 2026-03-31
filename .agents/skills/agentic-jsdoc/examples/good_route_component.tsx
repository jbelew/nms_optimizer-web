// @ts-nocheck
// GOOD EXAMPLE - React Router Component standard

import React from "react";
import { useParams } from "react-router-dom";

/**
 * A highly dynamic route component that fetches and displays user details.
 * 
 * @remarks
 * Inherits standard routing layout but relies entirely on React Router URL
 * parameters rather than direct component props.
 * 
 * @param {string} [URL/userId] - The UUID of the user to fetch, extracted via `useParams()`.
 * @returns {JSX.Element} The rendered user profile page.
 * @see {@link useUserProfileFetcher}
 * @component
 * @category Components
 * 
 * @example
 * // Accessed via /users/:userId => /users/123e4567
 * <UserProfileRoute />
 * // mounts UserProfileRoute and extracts userId="123e4567"
 */
export const UserProfileRoute: React.FC = () => {
  // LLM understands that `userId` here traces back to the JSDoc URL param
  const { userId } = useParams<{ userId: string }>();

  return <div>Loading profile for {userId}...</div>;
};
