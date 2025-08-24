import { useState, useEffect } from 'react';
import Image from 'next/image';
import LoadingSpinner from './LoadingSpinner';

export default function BackgroundLoader() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(true);

  useEffect(() => {
    // Hide fallback after image loads or after a timeout
    const timer = setTimeout(() => {
      setShowFallback(false);
    }, 2000); // Fallback timeout

    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setShowFallback(false);
  };

  return (
    <div className="fixed inset-0">
      {/* Fallback gradient background with loading indicator */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          showFallback ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #ddd6fe 100%)',
        }}
      >
        {/* Loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-strong p-6 rounded-2xl">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600 mt-4 text-center">Loading Promptinator...</p>
          </div>
        </div>
      </div>
      
      {/* Next.js Optimized Background Image */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Image
          src="/background.jpg"
          alt="Background"
          fill
          priority
          quality={85}
          className="object-cover"
          sizes="100vw"
          onLoad={handleImageLoad}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
      </div>
      
      {/* Glass Overlay for Better Contrast */}
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
      
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 via-transparent to-blue-900/10" />
    </div>
  );
}
