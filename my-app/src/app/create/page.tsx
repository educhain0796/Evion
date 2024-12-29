"use client";
import React, { useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import Token from "../contractInfo/contractAbi.json"
import contractAddress from "../contractInfo/contract.json"

interface EventData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  isPublic: boolean;
  imageUrl: string;
  isFree: boolean;
  requiresApproval: boolean;
  capacity: string;
}

const CreateEvent = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [imagePreview, setImagePreview] = useState<string>('https://png.pngtree.com/thumb_back/fh260/background/20230721/pngtree-3d-rendering-of-a-launching-rocket-image_3777838.jpg');
  const [isDragging, setIsDragging] = useState(false);

  const [eventData, setEventData] = useState<EventData>({
    id: '',
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    isPublic: true,
    imageUrl: 'https://png.pngtree.com/thumb_back/fh260/background/20230721/pngtree-3d-rendering-of-a-launching-rocket-image_3777838.jpg',
    isFree: true,
    requiresApproval: false,
    capacity: 'Unlimited'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (file: File) => {
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setEventData(prev => ({
          ...prev,
          imageUrl: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleCreateEvent = () => {
    try {
      donate();
      const newEvent = {
        ...eventData,
        id: Math.random().toString(36).substr(2, 9),
        isPublic
      };
  
      const existingEvents = JSON.parse(localStorage.getItem('events') || '[]');
      localStorage.setItem('events', JSON.stringify([...existingEvents, newEvent]));
      router.push('/events');
    } catch (error) {
      
    }

  };

  const donate = async (a = 20) => {
    const abi = Token.abi;
    const charge = "10";
    console.log(charge, "=========deposit=========");
    // const contractAddress = "0xcA03Dc4665A8C3603cb4Fd5Ce71Af9649dC00d44"
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    const questContract = new ethers.Contract(contractAddress.address, abi, signer)
    // mint();
    // console.log(balance, "========inside withdraw===")

    await (await questContract.transfer("0xe1b3df92a983bD27c4798867A1F425B3fA7c71a8", ethers.parseUnits(parseInt(charge).toString(), 18))).wait();
    // alert('Withdraw your earned EVO coins!');
    // await (await bounceContract.transfer(address, ethers.utils.parseUnits(charge.toString(), 18))).wait();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-800 via-purple-900 to-black flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-gradient-to-br from-black via-gray-800 to-purple-900 text-gray-100 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-700">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-semibold">Personal Calendar</span>
          <span
            className="text-gray-300 cursor-pointer font-medium px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            onClick={() => setIsPublic(!isPublic)}
          >
            {isPublic ? "Public" : "Private"}
          </span>
        </div>

        {/* Event Image Upload Section */}
        <div 
          className={`relative rounded-xl overflow-hidden shadow-lg ${isDragging ? 'border-2 border-purple-500' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="relative h-52">
            <img
              src={imagePreview}
              alt="Event"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
              <p className="text-white text-center mb-2">
                Drag & Drop an image or click to upload
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Choose File
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
        </div>

        {/* Event Name */}
        <input
          type="text"
          name="name"
          value={eventData.name}
          onChange={handleInputChange}
          placeholder="Event Name"
          className="w-full bg-gray-800 text-white text-2xl font-semibold rounded-lg px-4 py-3 outline-none border border-gray-600 focus:border-purple-500 transition duration-150 placeholder-gray-400"
        />

        {/* Date and Time */}
        <div className="flex justify-between items-center space-x-4">
          <div className="w-1/2">
            <label className="block text-gray-400 text-sm">Start</label>
            <input
              type="datetime-local"
              name="startDate"
              value={eventData.startDate}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-gray-100 rounded-lg px-4 py-2 mt-1 outline-none border border-gray-600 focus:border-purple-500 transition duration-150"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-gray-400 text-sm">End</label>
            <input
              type="datetime-local"
              name="endDate"
              value={eventData.endDate}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-gray-100 rounded-lg px-4 py-2 mt-1 outline-none border border-gray-600 focus:border-purple-500 transition duration-150"
            />
          </div>
        </div>

        {/* Event Location */}
        <input
          type="text"
          name="location"
          value={eventData.location}
          onChange={handleInputChange}
          placeholder="Add Event Location"
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-600 focus:border-purple-500 transition duration-150 placeholder-gray-400"
        />

        {/* Description */}
        <textarea
          name="description"
          value={eventData.description}
          onChange={handleInputChange}
          placeholder="Add Description"
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-600 focus:border-purple-500 transition duration-150 placeholder-gray-400"
          rows={3}
        ></textarea>

        {/* Event Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Tickets</span>
            <span className="text-white">Free</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Require Approval</span>
            <input
              type="checkbox"
              checked={eventData.requiresApproval}
              onChange={(e) => setEventData(prev => ({
                ...prev,
                requiresApproval: e.target.checked
              }))}
              className="form-checkbox text-purple-600 rounded focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Capacity</span>
            <span className="text-white">Unlimited</span>
          </div>
        </div>

        {/* Create Event Button */}
        <button
          onClick={handleCreateEvent}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold mt-4 shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105 duration-150"
        >
          Create Event
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;