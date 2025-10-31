import React, { useEffect } from 'react'
import { AxiosClient } from '../utils/AxiosClient'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu } from "react-icons/fi";
import { BiCommentError } from "react-icons/bi";
import { useState } from 'react';
import { ImCross } from "react-icons/im";
import { CgProfile } from "react-icons/cg";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import { IoLogOut } from "react-icons/io5";
import DropMenu from './DropMenu';
import {MapContainer,TileLayer,Marker,Popup} from 'react-leaflet'
import { KEY_ACCESS_TOKEN, removeitem } from '../utils/LocalStorageManager';
import { Icon } from "leaflet";
import car from '/sedan.png'


const Home = () => {

const [obstacles,setobstacles]=useState(null);
const [dropmenu, setdropmenu] = useState(false);
const [position, setPosition] = useState(null);
const navigate=useNavigate();

useEffect(()=>{
    getobstacles();
  },[])

useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setPosition([pos.coords.latitude,pos.coords.longitude]),
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

// icons
const defaultIcon = new Icon({
  iconUrl: '/location-unscreen.gif',
  iconSize: [58, 58],
  iconAnchor: [20, 41],
  popupAnchor:[0,-40]
});
const obsticons = {
  construction: new Icon({
    iconUrl: "/cnst.gif",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor:[0,-36]
  }),
  traffic_jam: new Icon({
    iconUrl: "/trfc.gif",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor:[0,-36]
  }),
  day_market: new Icon({
    iconUrl: "/dm.gif",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor:[0,-36]
  }),
  ceremony_blockage: new Icon({
    iconUrl: "/crm.gif",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor:[0,-36]
  }),
  road_problem: new Icon({
    iconUrl: "/rd.gif",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor:[0,-36]
  }),
  other: new Icon({
    iconUrl: "/other.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor:[0,-36]
  }),
};
//icons end

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position); // centers map whenever position updates
    }
  }, [position, map]);
  return null;
}

function RemoveTabIndex() {
  const map = useMap();

  useEffect(() => {
    map.getContainer().removeAttribute("tabindex");
  }, [map]);

  return null;
}
 
async function getobstacles(){
    try {
      const data=await AxiosClient.get('obstacles/all');
      if(data){
        setobstacles(data.result.obstacledata);
      }
    } catch (e) {
      console.log(e);
    }
  }
  
function submitclick(){
    navigate('/submitreport');
  }

function logoutclick(){
    removeitem(KEY_ACCESS_TOKEN);
    removeitem('user_email');
                //reload to login page
                window.location.replace('/login')
                return Promise.reject(error);
  }

function handleprofileclick(){
    navigate('/profile');
  }

 async function handleremove(id){
    const result=await AxiosClient.post('/remove',{
      obstacleId:id
    })
    if(result.status=='ok'){
      getobstacles();
    }
  }


  return (
    
  <>
  <div className='w-[100vw] h-[100vh] overflow-x-hidden overflow-y-hidden'>
    <div className='navbar absolute z-999 top-0 bg-white/20 backdrop-blur-sm  left-0 w-full h-[2vh] flex items-center justify-between px-[2vw] py-[3.5vw]'>
      <button onClick={()=>setdropmenu(true)}>
      <FiMenu className='text-black w-[5vw] h-[3vh]'/>
      </button>
      <img src="/logo.png" className='w-[11vw]' alt="" />
    </div>
     
      <div className={`w-[30vw] z-9999 p-[5vw] flex flex-col justify-between  top-0 ${dropmenu ? "left-[0]":"-left-[100%]"}  transition-all ease duration-1000 absolute h-[100vh] bg-zinc-200`}>
        <div className='flex justify-between'>
          <div className='text-black w-[50%]'>
            <h1 onClick={handleprofileclick} className='font-semibold border-b-[.1vw] py-[1vw] w-full text-xl  flex items-center gap-[1vw]'><CgProfile className='text-black' /> Profile</h1>
            <h1 onClick={() => navigate('/crowd-heatmap')} className='font-semibold border-b-[.1vw] py-[1vw] w-full text-lg flex items-center gap-[1vw] cursor-pointer hover:bg-white/20 transition-all ease rounded-lg '>📊 Crowd Heatmap</h1>
            <h1 onClick={() => navigate('/admin')} className='font-semibold border-b-[.1vw] py-[1vw] w-full text-lg flex items-center gap-[1vw] cursor-pointer hover:bg-white/20 transition-all ease rounded-lg '>Admin Panel</h1>
            <h1 onClick={() => navigate('/navigation')} className='font-semibold border-b-[.1vw] py-[1vw] w-full text-lg flex items-center gap-[1vw] cursor-pointer hover:bg-white/20 transition-all ease rounded-lg '>🧭 Smart Navigation</h1>
        </div>
        <div>
        <button onClick={()=>setdropmenu(false)} className='py-[1vw]'>
        <ImCross className='text-black text-lg' />
        </button>
        </div>
        </div>

        <div className='text-zinc-900 flex justify-between h-fit items-center '>
          <button onClick={logoutclick} className='p-[0.8vw] hover:p-[1vw] hover:text-red-500 h-fit transition-all ease bg-white rounded-lg'>
            <h1 className='text-lg flex gap-[.6vw] items-center'>Logout <IoLogOut /></h1>
          </button>
      <img src="/logo.png" className='w-[7vw]' alt="" />
        </div>
    </div>
      
    <div className='map w-[100vw] h-[100vh] flex justify-cente rounded-xl items-center'>

    {/* //MAP AAGYA */}
      <MapContainer className='w-full h-full flex rounded-xl'
      center={[23.25135046259892,77.46314875274241]}
      scrollWheelZoom={true}   // ✅ allow only scroll zoom
      doubleClickZoom={false}  // 🚫 disable double-click zoom
      zoomControl={false}      // 🚫 remove +/– buttons
      dragging={true}          // ✅ allow dragging
      touchZoom={false}        // 🚫 disable pinch zoom
      tap={false}  
      zoom={15}> 
      
      <TileLayer url='https://api.maptiler.com/maps/dataviz/256/{z}/{x}/{y}.png?key=pGrf8HRmLH2bdPgzO6GI'
      attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
      <RemoveTabIndex />
      {position && (
        <>
          <Marker position={position} icon={defaultIcon}>
            <Popup>
              <h1 className='w-fit'>Your current location</h1>
            </Popup>
          </Marker>
          <RecenterMap position={position} />
        </>
      )}
      {obstacles && obstacles.map((obs) => (
        <Marker
          key={obs._id}
          position={[obs.lat, obs.lng]}
          icon={obsticons[obs.obstacleType] || obsticons.other}
        >
          <Popup>
            <div className="popup-content">
              <div className="mb-2">
                <strong>Type:</strong> {obs.obstacleType.replace('_', ' ').toUpperCase()}
              </div>
              {obs.path && (
                <div className="mt-3">
                  <img
                    src={obs.path}
                    alt="Obstacle report"
                    className="w-full max-w-[200px] h-auto rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <button onClick={()=>handleremove(obs._id)} className='flex mt-[1vh] bg-red-500 p-[0.4vw] text-white text-xs rounded-lg items-center hover:p-[0.6vw] transition-all ease justify-center'>Remove Obstacle</button>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      </MapContainer>

    {/* //MAP ENDS */}
      <div className='submitbutton z-9999 w-fit bg-black flex items-center justify-center p-[0.8vw]
       rounded-lg absolute text-white top-[90%] left-[50%] -translate-x-[50%] -translate-y-[50%]'>
        <button onClick={submitclick} className='flex items-center hover:p-[0.4vw] transition-all ease justify-center'>
        <h1 className='mr-[5px] cursor-pointer'>Submit a report</h1><BiCommentError />
        </button>
        </div>
    </div>
  </div>
  
  </>
  
  )
}

export default Home