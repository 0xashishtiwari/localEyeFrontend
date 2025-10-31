import React from 'react'
import { getitem, KEY_ACCESS_TOKEN } from '../utils/LocalStorageManager'
import { Navigate, Outlet } from 'react-router-dom';
import Home from './Home';

const LoggedIn = () => {
    const user=getitem(KEY_ACCESS_TOKEN);
  return (
    !user ? <Navigate to="/login"/>:<Navigate to="/"/> 
  )
}

export default LoggedIn