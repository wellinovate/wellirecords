import React from 'react';
import { MapPin, Clock, Star, Users } from 'lucide-react';

const doctors = [
  {
    id: 1,
    name: "Dr. Sam Wallfolk",
    title: "Clinical psychologist",
    location: "New York, USA",
    rating: 5.0,
    experience: "15 yr of exp.",
    consultations: "1000+ consultations",
    price: "$80/h",
    onlineOffline: "Online/Offline",
    specialties: ["Abuse", "Depression", "PTSD"],
    avatar: "https://i.pravatar.cc/150?u=sam",
    badgeColor: "bg-emerald-500"
  },
  {
    id: 2,
    name: "Dr. Ben Affleck",
    title: "Military psychologist",
    location: "Los Angeles, USA",
    rating: 4.8,
    experience: "1 yr of exp.",
    consultations: "100+ consultations",
    price: "$50/h",
    onlineOffline: "Online",
    specialties: ["Abuse", "Food", "Mental Health"],
    avatar: "https://i.pravatar.cc/150?u=ben",
    badgeColor: "bg-amber-500"
  },
  {
    id: 3,
    name: "Dr. Sarah Legend",
    title: "Child psychologist",
    location: "Chicago, USA",
    rating: 5.0,
    experience: "20 yr of exp.",
    consultations: "2000+ consultations",
    price: "$120/h",
    onlineOffline: "Offline",
    specialties: ["Abuse", "Parenting", "Food"],
    avatar: "https://i.pravatar.cc/150?u=sarah",
    badgeColor: "bg-emerald-500"
  },
  {
    id: 4,
    name: "Dr. Angela Braun",
    title: "Forensic psychologist",
    location: "Philadelphia, USA",
    rating: 4.0,
    experience: "2 yr of exp.",
    consultations: "100+ consultations",
    price: "$40/h",
    onlineOffline: "Offline",
    specialties: ["Anxiety and Phobias", "Depression"],
    avatar: "https://i.pravatar.cc/150?u=angela",
    badgeColor: "bg-red-500"
  },
  {
    id: 5,
    name: "Dr. Dilan McCarter",
    title: "Industrial-Organizational psychologist",
    location: "San Diego, USA",
    rating: 5.0,
    experience: "8 yr of exp.",
    consultations: "100+ consultations",
    price: "$75/h",
    onlineOffline: "Online/Offline",
    specialties: ["Job and Career", "Stress"],
    avatar: "https://i.pravatar.cc/150?u=dilan",
    badgeColor: "bg-emerald-500"
  },
  {
    id: 6,
    name: "Dr. Evan Peters",
    title: "Clinical psychologist",
    location: "Houston, USA",
    rating: 4.3,
    experience: "3 yr of exp.",
    consultations: "400+ consultations",
    price: "$50/h",
    onlineOffline: "Online/Offline",
    specialties: ["Addictions", "Violence and aggression"],
    avatar: "https://i.pravatar.cc/150?u=evan",
    badgeColor: "bg-amber-500"
  },
];

const DoctorCard = ({ doctor }: { doctor: any }) => (
  <div className="bg-blue-950/30 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-500 text-white">
    {/* Header */}
    <div className=" flex  flex-col items-start gap-">
        <div className='flex px-4 pt-4 items-center justify-between w-full '>

      <img
        src={doctor.avatar}
        alt={doctor.name}
        className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex  items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-100">{doctor.name}</h3>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-medium ${doctor.badgeColor}`}>
            <Star className="w-4 h-4 fill-current" />
            {doctor.rating}
          </div>
        </div>
       
      </div>
        </div>
        <div className='flex px-4 flex-col w-full'> <p className="text-gray-100 mt-1">{doctor.title}</p>
        
        <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-100">
          <MapPin className="w-4 h-4" />
          <span>{doctor.location}</span>
        </div></div>
    </div>

    {/* Experience & Stats */}
    <div className="px-6 pb-2 pt-2 border-t border-gray-100">
      <div className="flex justify-between text-sm">
        <div>
          <p className="text-gray-100">Experience</p>
          <p className="font-semibold text-gray-900">{doctor.experience}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-100">Consultations</p>
          <p className="font-semibold text-gray-900">{doctor.consultations}</p>
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-2 mt-2">
        {doctor.specialties.map((spec: string, i: number) => (
          <span
            key={i}
            className="text-xs bg-gray-100 hover:bg-gray-200 transition px-3 py-1 rounded-full text-gray-700"
          >
            {spec}
          </span>
        ))}
        {doctor.specialties.length < 3 && <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700">+2</span>}
      </div>
    </div>

    {/* Footer - Price & Book Button */}
    <div className=" px-3">
      <button className="bg-blue-600 hover:bg-blue-700 w-full transition text-white font-semibold px-4 py-3 rounded-2xl text-sm">
        Contact Doctor
      </button>
    </div>
  </div>
);

export default function BestDoctorsPage() {
  return (
    <div className="min-h-screen text-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-semibold text-gray-100">Our Doctors</h1>
            
          </div>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            See all 
            <span className="text-xl leading-none">→</span>
          </button>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </div>
  );
}