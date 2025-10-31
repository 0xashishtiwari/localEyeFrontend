import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import { AxiosClient } from '../utils/AxiosClient';
import { FiUsers, FiArrowRight, FiArrowDown, FiArrowUp } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

const CrowdHeatmap = () => {
    const [crowdData, setCrowdData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDiverting, setIsDiverting] = useState(false);
    const [diversionResults, setDiversionResults] = useState(null);
    const [userCenter, setUserCenter] = useState(null);
    const [showDiversionResults, setShowDiversionResults] = useState(false);

    useEffect(() => {
        fetchCrowdData();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserCenter([pos.coords.latitude, pos.coords.longitude]),
                () => setUserCenter([26.9975, 75.8895]),
                { enableHighAccuracy: true }
            );
        } else {
            setUserCenter([26.9975, 75.8895]);
        }
        // Update data every 5 seconds
        const interval = setInterval(fetchCrowdData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchCrowdData = async () => {
        try {
            const response = await AxiosClient.get('/crowd/all');
            if (response.status === 'ok') {
                setCrowdData(response.result);
            }
        } catch (error) {
            console.error('Error fetching crowd data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDivertCrowd = async () => {
        setIsDiverting(true);
        try {
            const response = await AxiosClient.post('/crowd/divert');
            if (response.status === 'ok') {
                setDiversionResults(response.result);
                setShowDiversionResults(true);
                // Refresh data to show changes
                await fetchCrowdData();
                // Hide results after 5 seconds
                setTimeout(() => {
                    setShowDiversionResults(false);
                }, 5000);
            }
        } catch (error) {
            console.error('Error diverting crowd:', error);
        } finally {
            setIsDiverting(false);
        }
    };


    const getDensityColor = (density) => {
        if (density >= 80) return '#ff0000'; // Red - Critical
        if (density >= 60) return '#ff8800'; // Orange - High
        if (density >= 30) return '#ffdd00'; // Yellow - Medium
        return '#00ff00'; // Green - Low
    };

    const getDensityOpacity = (density) => {
        return Math.min(0.8, density / 100);
    };

    const getDensityRadius = (density, baseRadius) => {
        return baseRadius + (density / 100) * 50; // Scale radius based on density
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading crowd density data...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen">
            <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-2">JEC Campus Crowd Density</h2>
                <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span>Low (0-30%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <span>Medium (30-60%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                        <span>High (60-80%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span>Critical (80%+)</span>
                    </div>
                </div>
            </div>

            {/* Control Buttons */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <button
                    onClick={handleDivertCrowd}
                    disabled={isDiverting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        isDiverting
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                >
                    <FiUsers className="w-5 h-5" />
                    {isDiverting ? 'Diverting...' : 'Divert Crowd'}
                </button>
                {userCenter && (
                    <button
                        onClick={async () => {
                            try {
                                await AxiosClient.post('/crowd/initialize-at', { lat: userCenter[0], lng: userCenter[1] })
                                await fetchCrowdData()
                            } catch (e) {
                                console.error('Failed to initialize zones at location', e)
                            }
                        }}
                        className='flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white'
                    >
                        Use My Location for Zones
                    </button>
                )}
            </div>
            

            {/* Diversion Results */}

            {showDiversionResults && diversionResults && (
                <div className="absolute top-35 right-4 z-[1000] bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-md">
                    <h3 className="text-lg font-bold mb-3 text-green-600 flex items-center gap-2">
                        <FiArrowRight className="w-5 h-5" />
                        Crowd Diversion Results
                    </h3>
                    {diversionResults.diversions && diversionResults.diversions.length > 0 ? (
                        <div className="space-y-3">
                            {diversionResults.diversions.map((diversion, index) => (
                                <div key={index} className="border-l-4 border-blue-500 pl-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <FiArrowDown className="w-4 h-4 text-red-500" />
                                        <span className="font-medium">{diversion.from.zoneName}</span>
                                        <span className="text-red-600 font-bold">
                                            {diversion.from.peopleMoved} people
                                        </span>
                                        <span className="text-gray-500">
                                            ({diversion.from.newDensity.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm mt-1">
                                        <FiArrowUp className="w-4 h-4 text-green-500" />
                                        <span className="font-medium">{diversion.to.zoneName}</span>
                                        <span className="text-green-600 font-bold">
                                            +{diversion.to.peopleMoved} people
                                        </span>
                                        <span className="text-gray-500">
                                            ({diversion.to.newDensity.toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-sm">{diversionResults.message}</p>
                    )}
                </div>
            )}

            <MapContainer
                center={userCenter || [26.9975, 75.8895]}
                zoom={16}
                className="w-full h-full"
                scrollWheelZoom={true}
                doubleClickZoom={false}
                zoomControl={false}
                dragging={true}
                touchZoom={false}
                tap={false}
            >
                <TileLayer 
                    url='https://api.maptiler.com/maps/dataviz/256/{z}/{x}/{y}.png?key=pGrf8HRmLH2bdPgzO6GI'
                    attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
                />
                
                {crowdData.map((zone) => (
                    <Circle
                        key={zone.zoneId}
                        center={[zone.lat, zone.lng]}
                        radius={getDensityRadius(zone.currentDensity, zone.radius)}
                        pathOptions={{
                            color: getDensityColor(zone.currentDensity),
                            fillColor: getDensityColor(zone.currentDensity),
                            fillOpacity: getDensityOpacity(zone.currentDensity),
                            weight: 2
                        }}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-lg">{zone.zoneName}</h3>
                                <div className="mt-2 space-y-1">
                                    <p><strong>People:</strong> {zone.peopleCount}/{zone.maxCapacity}</p>
                                    <p><strong>Density:</strong> {zone.currentDensity.toFixed(1)}%</p>
                                    <p><strong>Level:</strong> 
                                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                            zone.densityLevel === 'critical' ? 'bg-red-100 text-red-800' :
                                            zone.densityLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                                            zone.densityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {zone.densityLevel.toUpperCase()}
                                        </span>
                                    </p>
                                    <p><strong>Trend:</strong> 
                                        <span className={`ml-1 flex items-center gap-1 ${
                                            zone.trend === 'increasing' ? 'text-red-600' :
                                            zone.trend === 'decreasing' ? 'text-green-600' :
                                            'text-gray-600'
                                        }`}>
                                            {zone.trend === 'increasing' ? <FiArrowUp className="w-4 h-4" /> : 
                                             zone.trend === 'decreasing' ? <FiArrowDown className="w-4 h-4" /> : 
                                             <FiArrowRight className="w-4 h-4" />} 
                                            <span className="capitalize">{zone.trend}</span>
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Last updated: {new Date(zone.lastUpdated).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </Popup>
                    </Circle>
                ))}
            </MapContainer>
        </div>
    );
};

export default CrowdHeatmap;
