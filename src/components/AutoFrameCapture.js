import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

const AutoFrameCapture = () => {
  const videoRef = useRef(null);
  const [gesture, setGesture] = useState(null);

  // Start the camera on component mount.
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Error accessing camera:", err));
  }, []);

  // Automatically capture frames at a set interval.
  useEffect(() => {
    const captureInterval = setInterval(() => {
      if (!videoRef.current) return;
      const video = videoRef.current;

      // Create a canvas element to draw the video frame.
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert the canvas content to a Blob.
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');

        try {
          // Post the captured frame to the backend prediction endpoint.
          const response = await axios.post(
            process.env.REACT_APP_API_URL + '/predict',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          // Update the detected gesture.
          setGesture(response.data.gesture);
        } catch (error) {
          console.error("Error during inference:", error);
        }
      }, 'image/jpeg');
    }, 1000); // Adjust the interval as needed (1000ms = 1 second).

    return () => clearInterval(captureInterval);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '600px' }} />
      <div style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
        {gesture ? `Detected Gesture: ${gesture}` : 'Detecting gesture...'}
      </div>
    </div>
  );
};

export default AutoFrameCapture;
