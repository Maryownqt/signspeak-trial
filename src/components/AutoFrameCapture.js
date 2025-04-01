import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

const AutoFrameCapture = () => {
  const videoRef = useRef(null);
  const [gesture, setGesture] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

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
      if (!videoRef.current || isPredicting) return;

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');

        try {
          setIsPredicting(true);
          const response = await axios.post(
            process.env.REACT_APP_API_URL + '/predict',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          setGesture(response.data.gesture);
        } catch (error) {
          console.error("Error during inference:", error);
        } finally {
          setIsPredicting(false);
        }
      }, 'image/jpeg');
    }, 1000); // You can tweak this timing for faster/slower predictions

    return () => clearInterval(captureInterval);
  }, [isPredicting]);

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
