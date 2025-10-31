import React from 'react'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Form from './components/Form'
import {Routes,Route} from 'react-router-dom'
import Home from './components/Home'
import RequireUser from './components/RequireUser'
import Profile from './components/Profile'
import CrowdHeatmap from './components/CrowdHeatmap'
import Navigation from './components/Navigation'
import Admin from './components/Admin'
import LoggedIn from './components/LoggedIn'

const App = () => {
  return (
    <div className='w-[100vw] h-[100vh]'>
      <Routes>
        <Route element={<RequireUser/>}>
        <Route path='/' element={<Home/>} />
        <Route path='/crowd-heatmap' element={<CrowdHeatmap/>} />
        <Route path='/navigation' element={<Navigation/>} />
        <Route path='/admin' element={<Admin/>} />
        <Route path='/submitreport' element={<Form/>}/>
        <Route path='/profile' element={<Profile/>}/>
        </Route>
        <Route element={<LoggedIn/>}>
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<SignUp/>} />
        </Route>
        
      </Routes>
    </div>
  )
}

export default App