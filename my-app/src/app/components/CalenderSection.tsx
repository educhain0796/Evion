import React from 'react';

const CalendarSection = () => {
  const calendars = [
    {
      name: 'Build Week',
      description: 'Education and entertainment for engineers and entrepreneurs.',
      logo: 'https://www.tradefairdates.com/logos/korea_build_week_goyang_logo_14100.png',
      subscribe: true,
    },
    {
      name: 'Austin Tech Week',
      description: 'Explore side events at Austin Tech Week from October 28-1, ...',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvBZnQ1xPrA-21z_E3yVDUgEeDzRVEf3k_VA&s',
      subscribe: true,
    },
    {
      name: '#HKWeb3 Events Calendar',
      description: 'The Hong Kong Web3 calendar of events - curated by...',
      logo: 'https://cdn.i-scmp.com/sites/default/files/d8/images/canvas/2024/03/08/2e0c9793-9c10-494d-861d-e8ca9b89d22e_e89e7a52.jpg',
      subscribe: true,
    },
    // Add more calendar items here
  ];

  return (
    <section className="px-6 py-8">
      <h2 className="text-white text-2xl font-semibold mb-4">Featured Calendars</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calendars.map((calendar, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col">
            <div className="flex items-center mb-4">
              <img src={calendar.logo} alt={`${calendar.name} logo`} className="h-10 w-10 rounded-full mr-3" />
              <div>
                <h3 className="text-white font-semibold">{calendar.name}</h3>
                <p className="text-gray-400 text-sm">{calendar.description}</p>
              </div>
            </div>
            {calendar.subscribe && (
              <button className="mt-auto bg-blue-600 text-white text-sm py-1 px-3 rounded-md hover:bg-blue-700">
                Subscribe
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CalendarSection;
