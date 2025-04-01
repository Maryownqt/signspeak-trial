import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

const AutoFrameCapture = () => {
  const videoRef = useRef(null);
  const [gesture, setGesture] = useState(null);

  // Start the camera
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Error accessing camera:", err));
  }, []);

  // Automatically capture frames at an interval (e.g., every 1 second)
  useEffect(() => {
    const captureInterval = setInterval(() => {
      if (!videoRef.current) return;
      const video = videoRef.current;

      // Create a canvas and draw the current frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert the canvas to a Blob (JPEG)
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');

        try {
          const response = await axios.post(
            process.env.REACT_APP_API_URL + '/predict',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          setGesture(response.data.gesture);
        } catch (error) {
          console.error("Error during inference:", error);
        }
      }, 'image/jpeg');
    }, 1000); // Adjust interval as needed

    return () => clearInterval(captureInterval);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '600px' }} />
      <div style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
        {gesture ? `Detected Gesture: ${gesture}` : 'Detecting...'}
      </div>
    </div>
  );
};

export default AutoFrameCapture;
