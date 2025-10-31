import React, { useEffect, useState } from 'react';
import { getitem } from '../utils/LocalStorageManager';
import { useNavigate } from 'react-router-dom';
import { AxiosClient } from '../utils/AxiosClient';

const Form = () => {
  const [obstacleType, setObstacleType] = useState('');
  const [otherValue, setOtherValue] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🧭 Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error('Location error:', err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // 📸 Image preview handler
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  // 🚀 Submit form
  async function handleRepSubmit(e) {
    e.preventDefault();

    if (!location) return alert('Fetching location... please wait.');
    if (!image) return alert('Please select an image.');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('obstacleType', obstacleType === 'other' ? otherValue : obstacleType);
      formData.append('reportimage', image);
      formData.append('email', getitem('user_email'));
      formData.append('lat', location.lat);
      formData.append('lng', location.lng);

      const response = await AxiosClient.post('/obstacles/report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const obstacle = response?.result?.obstacle;
      if (obstacle && obstacle.path) {
        // console.log('✅ Cloudinary Image URL:', obstacle.path);
        alert('Obstacle reported successfully!');
        setPreview(''); // Reset preview
        setImage(null);
        navigate('/');
      } else {
        console.error('❌ Unexpected response:', response);
        alert('Upload failed. Please try again.');
      }
    } catch (err) {
      // console.log('❌ Error submitting form:', err);
      alert(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[100vw] h-[100vh] flex flex-col justify-center items-center bg-zinc-900">
      <img src="/logo2.png" className="w-[15vw] mb-2" alt="Logo" />
      <div className="w-[40vw] bg-white rounded-lg p-[1.5vw] text-black shadow-md">
        <h1 className="text-xl font-semibold mb-[2vh] text-center">
          Submit a New Obstacle
        </h1>

        <form onSubmit={handleRepSubmit} encType="multipart/form-data">
          {/* Obstacle Type */}
          <label className="font-semibold">Choose Type of Obstacle</label>
          <select
            className="block w-full border p-2 mt-1 mb-3 rounded"
            value={obstacleType}
            onChange={(e) => setObstacleType(e.target.value)}
            required
          >
            <option value="">Select...</option>
            <option value="road_problem">Road Problem</option>
            <option value="dead_animal">Dead Animal</option>
            <option value="garbage_blockage">Garbage Blockage</option>
            <option value="construction">Construction</option>
            <option value="sewage_junk">Sewage Junk</option>
            <option value="other">Other</option>
          </select>

          {/* Other Type */}
          {obstacleType === 'other' && (
            <input
              type="text"
              placeholder="Please specify"
              className="w-full border p-2 mb-3 rounded"
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              required
            />
          )}

          {/* Upload Image */}
          <label className="font-semibold">Upload Image</label>
          <div className="flex items-center gap-3 mt-1 mb-3">
            <label
              htmlFor="reportimage"
              className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Choose File
            </label>
            <input
              type="file"
              id="reportimage"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              required
            />
            <span className="text-gray-700 text-sm">
              {image ? image.name : 'No file chosen'}
            </span>
          </div>

          {/* Image Preview */}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-[200px] object-cover rounded mb-3 border"
            />
          )}

          {/* Buttons */}
          <div className="flex justify-center gap-3 mt-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Go Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
