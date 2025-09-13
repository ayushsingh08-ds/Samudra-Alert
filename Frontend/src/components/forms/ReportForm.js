import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Upload, X } from 'lucide-react';

const ReportForm = ({ onSubmit, onCancel, initialData = null, isEditing = false }) => {
  const [selectedLocation, setSelectedLocation] = useState(
    initialData?.location || null
  );
  const [images, setImages] = useState(initialData?.images || []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      type: initialData?.type || 'flood',
      severity: initialData?.severity || 'medium',
      description: initialData?.description || '',
      location: initialData?.location?.address || ''
    }
  });

  const reportTypes = [
    { value: 'flood', label: 'Flooding' },
    { value: 'storm', label: 'Storm/Cyclone' },
    { value: 'tsunami', label: 'Tsunami' },
    { value: 'pollution', label: 'Water Pollution' },
    { value: 'other', label: 'Other' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ];

  const handleLocationSelect = () => {
    // In a real app, this would open a map picker
    // For now, we'll simulate getting current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
          };
          setSelectedLocation(location);
          setValue('location', location.address);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Mumbai coordinates
          const location = {
            lat: 19.0760,
            lng: 72.8777,
            address: 'Mumbai, India (Default)'
          };
          setSelectedLocation(location);
          setValue('location', location.address);
        }
      );
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = (data) => {
    const reportData = {
      ...data,
      location: selectedLocation,
      images: images,
      reportedAt: initialData?.reportedAt || new Date(),
      id: initialData?.id || Date.now()
    };
    onSubmit(reportData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit Report' : 'Submit New Report'}
        </h2>
        <p className="text-gray-600 mt-1">
          Report ocean hazards to help keep your community safe
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Report Title *
          </label>
          <input
            type="text"
            id="title"
            {...register('title', { 
              required: 'Title is required',
              minLength: { value: 5, message: 'Title must be at least 5 characters' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            placeholder="Brief description of the hazard"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Type and Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Hazard Type *
            </label>
            <select
              id="type"
              {...register('type', { required: 'Please select a hazard type' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level *
            </label>
            <select
              id="severity"
              {...register('severity', { required: 'Please select severity level' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            >
              {severityLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            {errors.severity && (
              <p className="mt-1 text-sm text-red-600">{errors.severity.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description', { 
              required: 'Description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            placeholder="Detailed description of the hazard, including what you observed and any immediate dangers..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="location"
              {...register('location', { required: 'Location is required' })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              placeholder="Enter location or use current location"
              readOnly
            />
            <button
              type="button"
              onClick={handleLocationSelect}
              className="px-4 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>Use Current</span>
            </button>
          </div>
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to upload photos or drag and drop
              </span>
              <span className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </span>
            </label>
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-xs">{image.name || `Image ${index + 1}`}</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ocean-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : isEditing ? 'Update Report' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;