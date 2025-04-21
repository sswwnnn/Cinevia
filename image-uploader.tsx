import React from 'react';

interface ImageUploaderProps {
  onUpload: (url: string) => void; // Ensure this prop is defined
  imageUrl?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, imageUrl }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Convert the file to a URL
      const url = URL.createObjectURL(file);
      onUpload(url);
    }
  };

  return (
    <div className="image-uploader">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {imageUrl && <img src={imageUrl} alt="Avatar" />}
    </div>
  );
};

export default ImageUploader;
