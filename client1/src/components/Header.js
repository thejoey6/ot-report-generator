import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';


//logout button -- need to add more functionality later.
export default function LogoutButton() {
  const { logout } = useContext(AuthContext);
  return <button onClick={logout}>Logout!</button>;
}