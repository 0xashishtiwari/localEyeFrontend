import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AxiosClient } from '../utils/AxiosClient';
import { getitem } from '../utils/LocalStorageManager';

const Profile = () => {
  const [name, setname] = useState('')
  const [obstacles, setobstacles] = useState(null)
  const [loading, setLoading] = useState(true)
  const email=getitem('user_email')
  useEffect(()=>{
    getuserdata();
    getobstacledata();
  },[])
  async function getuserdata(){
    try {
      const userdata= await AxiosClient.get('/profiledetails',{
        headers:{
          email:email
        }
      });
      setname(userdata.result.name);
    } catch (e) {
      console.log(e);
      
    }
  }
  async function getobstacledata(){
    try {
      const obsdata= await AxiosClient.get('/obstacles/user',{
        headers:{
          email:email
        }
      });
      setobstacles(obsdata.result.data || [])
    } catch (e) {
      console.log(e);
      
    }
    finally{
      setLoading(false)
    }
  }
  
  
  const navigate=useNavigate();
  return (
    <div className='min-h-screen bg-gradient-to-b from-zinc-100 to-white p-6'>
      <div className='max-w-5xl mx-auto'>
        <header className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-4'>
            <img src="/logo.png" className='w-20 h-20 object-contain' alt="logo" />
            <div>
              <h1 className='text-2xl font-bold'>Profile</h1>
              <p className='text-sm text-gray-500'>Manage your account and reports</p>
            </div>
          </div>
          <button onClick={()=>navigate(-1)} className='bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-600 transition'>Go back</button>
        </header>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='md:col-span-1 bg-white rounded-lg p-6 shadow'>
            <div className='flex flex-col items-center text-center'>
              <div className='w-28 h-28 bg-green-100 rounded-full flex items-center justify-center text-3xl font-semibold text-green-700'>
                {name ? name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'U'}
              </div>
              <h2 className='mt-4 text-lg font-semibold'>{name || 'Unknown User'}</h2>
              <p className='text-sm text-gray-500 break-words'>{email}</p>
            </div>
            <div className='mt-6'>
              <h3 className='text-sm text-gray-500'>Reports Submitted</h3>
              <div className='text-2xl font-bold'>{obstacles ? obstacles.length : 0}</div>
            </div>
          </div>

          <div className='md:col-span-2 bg-white rounded-lg p-6 shadow'>
            <h3 className='text-xl font-semibold mb-4'>Reports</h3>
            {loading ? <div className='text-gray-500'>Loading...</div> : (
              obstacles && obstacles.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {obstacles.map(obs => {
                    const formatType = (t) => t ? t.split('_').map(s => s[0].toUpperCase()+s.slice(1)).join(' ') : '';
                    return (
                      <div key={obs._id} className='bg-zinc-50 rounded-lg overflow-hidden border'>
                        <div className='w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden'>
                          <img
                            src={obs.path}
                            alt={obs.obstacleType}
                            className='object-cover w-full h-full'
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="20">No image</text></svg>';
                            }}
                          />
                        </div>
                        <div className='p-3'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm font-semibold'>{formatType(obs.obstacleType)}</span>
                            <span className='text-xs text-gray-400'>{obs?.createdAt ? new Date(obs.createdAt).toLocaleDateString() : ''}</span>
                          </div>
                          <p className='mt-2 text-sm text-gray-600 truncate'>{obs.description || ''}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className='py-12 text-center text-gray-500'>No reports yet. Submit one from the home page.</div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile