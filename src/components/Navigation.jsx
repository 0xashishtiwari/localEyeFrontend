import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { AxiosClient } from '../utils/AxiosClient';
import { FiNavigation, FiMapPin, FiAlertTriangle, FiTruck, FiUser, FiZap, FiSearch, FiX } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

const Navigation = () => {
    const [startLocation, setStartLocation] = useState(null);
    const [destination, setDestination] = useState('');
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [obstacles, setObstacles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [alternativeTransport, setAlternativeTransport] = useState(null);
    const [routeDetails, setRouteDetails] = useState(null);
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        fetchObstacles();
        getCurrentLocation();
    }, []);

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setStartLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Default to JEC campus if location access denied
                    setStartLocation([22.7196, 75.8577]);
                }
            );
        } else {
            setStartLocation([22.7196, 75.8577]);
        }
    };

    const fetchObstacles = async () => {
        try {
            const response = await AxiosClient.get('/obstacles/public');
            if (response.status === 'ok') {
                setObstacles(response.result.obstacledata);
            }
        } catch (error) {
            console.error('Error fetching obstacles:', error);
        }
    };

    const handleDestinationChange = async (value) => {
        setDestination(value);
        
        if (value.length < 3) {
            setLocationSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for search
        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await AxiosClient.post('/geocoding/geocode', {
                    address: value
                });

                if (response.status === 'ok') {
                    setLocationSuggestions(response.result.locations);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error('Error searching locations:', error);
                setLocationSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 500); // Wait 500ms after user stops typing
    };

    const selectLocation = (location) => {
        setDestination(location.name);
        setDestinationCoords(location.coordinates);
        setShowSuggestions(false);
        setLocationSuggestions([]);
    };

    const handleRoutePlanning = async () => {
        if (!destinationCoords || !startLocation) {
            alert('Please select a valid destination from the suggestions');
            return;
        }

        setIsLoading(true);
        try {
            const response = await AxiosClient.post('/geocoding/multiple-routes', {
                start: {
                    coordinates: [startLocation[1], startLocation[0]] // Convert [lat,lng] to [lng,lat]
                },
                end: {
                    coordinates: destinationCoords // Already [lng,lat]
                },
                obstacles: obstacles // Pass obstacles for route planning
            });

            if (response.status === 'ok') {
                setRoutes(response.result.routes);
                setSelectedRoute(response.result.routes[0]);
                setRouteDetails({
                    distance: response.result.routes[0]?.distance || 'N/A',
                    estimatedTime: response.result.routes[0]?.estimatedTime || 'N/A',
                    obstacleCount: obstacles.filter(obs => obs.status !== 'resolved').length
                });
            }
        } catch (error) {
            console.error('Error planning route:', error);
            alert('Error planning route. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getTransportIcon = (transportMode) => {
        switch (transportMode) {
            case 'walking':
                return <FiUser className="w-5 h-5" />;
            case 'bicycle':
                return <FiZap className="w-5 h-5" />;
            case 'car':
                return <FiTruck className="w-5 h-5" />;
            default:
                return <FiNavigation className="w-5 h-5" />;
        }
    };

    const getTransportColor = (transportMode) => {
        switch (transportMode) {
            case 'walking':
                return 'text-green-600 bg-green-100';
            case 'bicycle':
                return 'text-blue-600 bg-blue-100';
            case 'car':
                return 'text-purple-600 bg-purple-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getObstacleIcon = (obstacleType) => {
        switch (obstacleType) {
            case 'construction':
                return '🚧';
            case 'accident':
                return '🚨';
            case 'traffic':
                return '🚦';
            case 'roadblock':
                return '🚫';
            default:
                return '⚠️';
        }
    };

    if (!startLocation) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Getting your location...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen relative">
            {/* Navigation Panel */}
            <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-md">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FiNavigation className="w-6 h-6 text-blue-600" />
                    Real-Time Navigation
                </h2>

                {/* Destination Input with Autocomplete */}
                <div className="mb-4 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={destination}
                            onChange={(e) => handleDestinationChange(e.target.value)}
                            placeholder="Enter destination (e.g., Indore Railway Station, Rajwada Palace)"
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-2.5">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                        {destination && !isSearching && (
                            <button
                                onClick={() => {
                                    setDestination('');
                                    setDestinationCoords(null);
                                    setShowSuggestions(false);
                                }}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Location Suggestions */}
                    {showSuggestions && locationSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {locationSuggestions.map((location, index) => (
                                <button
                                    key={index}
                                    onClick={() => selectLocation(location)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <FiMapPin className="w-4 h-4 text-blue-600" />
                                        <div>
                                            <div className="font-medium text-sm">{location.name}</div>
                                            <div className="text-xs text-gray-500 capitalize">{location.type}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Plan Route Button */}
                <button
                    onClick={handleRoutePlanning}
                    disabled={isLoading || !destinationCoords}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        isLoading || !destinationCoords
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                >
                    <FiNavigation className="w-5 h-5" />
                    {isLoading ? 'Planning Route...' : 'Plan Route'}
                </button>

                {/* Route Details */}
                {routeDetails && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">Route Summary</h3>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p><strong>Distance:</strong> {routeDetails.distance}</p>
                            <p><strong>Estimated Time:</strong> {routeDetails.estimatedTime}</p>
                            <p><strong>Obstacles Detected:</strong> {routeDetails.obstacleCount}</p>
                        </div>
                    </div>
                )}

                {/* Alternative Transportation */}
                {alternativeTransport && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                            <FiAlertTriangle className="w-5 h-5" />
                            Alternative Routes Blocked
                        </h3>
                        <div className="text-sm text-yellow-700">
                            <p className="mb-2">All vehicle routes are blocked. Suggested transportation:</p>
                            <div className="space-y-2">
                                {alternativeTransport.map((transport, index) => (
                                    <div key={index} className={`flex items-center gap-2 px-2 py-1 rounded ${getTransportColor(transport.type)}`}>
                                        {getTransportIcon(transport.type)}
                                        <span className="font-medium capitalize">{transport.type}</span>
                                        <span className="text-xs">({transport.reason})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Route Legend */}
            {routes.length > 0 && (
                <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                    <h4 className="font-semibold text-sm mb-2">Route Legend</h4>
                    <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Primary Route</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span>Alternate Route</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>Alternative Route 2</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Route Options */}
            {routes.length > 0 && (
                <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-sm">
                    <h3 className="font-bold mb-3">Available Routes</h3>
                    <div className="space-y-2">
                        {routes.map((route, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedRoute(route)}
                                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                                    selectedRoute === route
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {getTransportIcon(route.transportMode)}
                                            {route.transportMode.charAt(0).toUpperCase() + route.transportMode.slice(1)}
                                            {route.routeType === 'alternate' && (
                                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                                    Alternate
                                                </span>
                                            )}
                                            {route.routeType === 'alternate-2' && (
                                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                    Alt 2
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {route.distance} • {route.estimatedTime}
                                        </div>
                                        {route.blockedBy && route.blockedBy.length > 0 && (
                                            <div className="text-xs text-red-600 mt-1">
                                                Avoids: {route.blockedBy.map(obs => obs.type).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs ${
                                        route.routeType === 'primary' ? 'bg-green-100 text-green-800' :
                                        route.routeType === 'alternate' ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {route.routeType === 'primary' ? 'Primary' :
                                         route.routeType === 'alternate' ? 'Alternate' : 'Alt 2'}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Map */}
            <MapContainer
                center={startLocation}
                zoom={15}
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

                {/* Start Location Marker */}
                <Marker position={startLocation}>
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold text-lg">Your Location</h3>
                            <p className="text-sm text-gray-600">Starting point</p>
                        </div>
                    </Popup>
                </Marker>

                {/* Destination Marker */}
                {destinationCoords && (
                    <Marker position={[destinationCoords[1], destinationCoords[0]]}>
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-lg">Destination</h3>
                                <p className="text-sm text-gray-600">{destination}</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Selected Route */}
                {selectedRoute && (
                    <Polyline
                        positions={selectedRoute.coordinates}
                        pathOptions={{
                            color: selectedRoute.routeType === 'primary' ? '#3b82f6' : 
                                   selectedRoute.routeType === 'alternate' ? '#f59e0b' : '#ef4444',
                            weight: 4,
                            opacity: 0.8
                        }}
                    />
                )}

                {/* All Routes */}
                {routes.map((route, index) => (
                    selectedRoute !== route && (
                        <Polyline
                            key={index}
                            positions={route.coordinates}
                            pathOptions={{
                                color: route.routeType === 'primary' ? '#3b82f6' : 
                                       route.routeType === 'alternate' ? '#f59e0b' : '#ef4444',
                                weight: 2,
                                opacity: 0.4,
                                dashArray: '5, 5'
                            }}
                        />
                    )
                ))}

                {/* Obstacles */}
                {obstacles.map((obstacle, index) => (
                    <Marker key={index} position={[parseFloat(obstacle.lat), parseFloat(obstacle.lng)]}>
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    {getObstacleIcon(obstacle.obstacleType)}
                                    {obstacle.obstacleType.charAt(0).toUpperCase() + obstacle.obstacleType.slice(1)}
                                </h3>
                                <div className="mt-2 space-y-1 text-sm">
                                    <p><strong>Reported by:</strong> {obstacle.email}</p>
                                    {obstacle && obstacle.path && (
                                        <div className="mt-3">
                                            <img
                                                src={`http://localhost:4000/${obstacle.path}`}
                                                alt="Obstacle report"
                                                className="w-full max-w-[200px] h-auto rounded-lg shadow-sm"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Navigation;