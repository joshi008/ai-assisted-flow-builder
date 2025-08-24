export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-white/20 border-t-white/80`}
        style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3))',
          borderRadius: '50%',
        }}
      />
    </div>
  );
}
