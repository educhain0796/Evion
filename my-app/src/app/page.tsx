"use client"
import React from "react";
import CalendarSection from "./components/CalenderSection";
import Footer from "./components/Footer";

const Home: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-purple-700 via-black to-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto py-16 px-8 space-y-16">
        {/* Title and Description */}
        <section className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold mb-2 tracking-wide">Discover Events with Evion</h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Explore top events around the world, find events by category, and get inspired by trending events.
          </p>
        </section>

        {/* Explore Local Events */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">Explore Local Events</h2>
          <div className="flex justify-center space-x-4 mb-10">
            {["Asia & Pacific", "Europe", "Africa", "Americas"].map((region) => (
              <button
                key={region}
                className="px-5 py-2 rounded-full bg-gray-700 hover:bg-gray-600 transition ease-in-out duration-300 text-gray-200 font-medium text-sm shadow-md"
              >
                {region}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {[
              { name: "Bangkok", events: 80, color: "bg-yellow-600" },
              { name: "Tokyo", events: 15, color: "bg-orange-500" },
              { name: "Dubai", events: 16, color: "bg-purple-600" },
              { name: "New Delhi", events: 10, color: "bg-red-500" },
              { name: "Singapore", events: 25, color: "bg-green-500" },
              { name: "Sydney", events: 17, color: "bg-blue-500" },
              { name: "Seoul", events: 4, color: "bg-blue-300" },
              { name: "Mumbai", events: 2, color: "bg-red-400" },
            ].map((city) => (
              <div
                key={city.name}
                className="flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 hover:bg-gray-700 transition duration-300 ease-in-out"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${city.color} shadow-md mb-4`}>
                  <span className="text-white font-semibold text-lg">{city.events}</span>
                </div>
                <h3 className="font-semibold text-xl">{city.name}</h3>
                <p className="text-gray-400 text-sm">{city.events} Events</p>
              </div>
            ))}
          </div>
        </section>

        {/* Browse by Category */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {[
              { name: "Music", icon: "🎵", color: "bg-green-500" },
              { name: "Art", icon: "🎨", color: "bg-orange-500" },
              { name: "Tech", icon: "💻", color: "bg-blue-500" },
              { name: "Food", icon: "🍔", color: "bg-red-500" },
              { name: "Sports", icon: "⚽", color: "bg-yellow-500" },
              { name: "Education", icon: "📚", color: "bg-purple-500" },
              { name: "Health", icon: "🧘", color: "bg-teal-500" },
            ].map((category) => (
              <div
                key={category.name}
                className="flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 hover:bg-gray-700 transition duration-300 ease-in-out"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color} shadow-md mb-4`}>
                  <span className="text-white text-2xl">{category.icon}</span>
                </div>
                <h3 className="font-semibold text-xl">{category.name}</h3>
              </div>
            ))}
          </div>
        </section>
        <CalendarSection/>
      </div>
      <Footer/>
    </div>
  );
};

export default Home;
