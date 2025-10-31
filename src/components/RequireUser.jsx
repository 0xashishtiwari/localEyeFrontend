import React from 'react'
import { getitem, KEY_ACCESS_TOKEN } from '../utils/LocalStorageManager'
import { Navigate, Outlet } from 'react-router-dom';

const RequireUser = () => {
    const user=getitem(KEY_ACCESS_TOKEN);
  return (
    user ? <Outlet/> : <Navigate to="/login"/>
  )
}

export default RequireUser