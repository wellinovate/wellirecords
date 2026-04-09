import React from 'react';
import { 
  Calendar, 
  FileText, 
  MessageCircle, 
  Plus, 
  Eye, 
  Shield
} from 'lucide-react';

const PatientProfile = ({patient}: any) => {
  const patients = {
    name: "Diane Cooper",
    age: 15,
    gender: "Female",
    birthday: "Feb 24th, 1997",
    phone: "(239) 555-0108",
    address: "71 St. Spongebob No. 21, Chicago",
    zip: "686847",
    memberStatus: "Active Member",
    registeredDate: "Feb 24th, 1997",
    avatar: "https://i.pravatar.cc/150?u=diane" // Replace with real image
  };

  const upcomingAppointments = [
    {
      date: "26 Nov '19",
      time: "09:00 - 10:00",
      treatment: "Root Canal Treatment",
      doctor: "Dr. Adam H.",
      nurse: "Jessicamo",
      status: "Open Access"
    },
    {
      date: "12 Dec '19",
      time: "08:00 - 09:00",
      treatment: "Root Canal prep",
      doctor: "Dr. Adam H.",
      nurse: "Jessicamo",
      status: "Open Access"
    }
  ];

  

  return (
    <div className="min-h-auto bg-gray-200 p-5 rounded-2xl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Patient Profile</h1>
            <p className="text-gray-500">Manage patient records and information</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 text-green-800 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition">
              <MessageCircle size={18} />
              Send Message
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
              <Plus size={18} />
              New Appointment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Patient Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Patient Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={patient?.avatar || patients?.avatar} 
                  alt={patient?.fullName || ""}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{patient?.fullName}</h2>
                  <h2 className="text-xs font-semibold text-gray-900">{patient?.email}</h2>
                  <div className="">
                    {patient?.wrId && (
                      <span className="text-[14px] font-bold text-[#01070f]">
                        {patient?.wrId}
                      </span>
                    )}

                    
                  </div>
                  <div className="mt-">
                    <button
                      className="inline-flex h-8 items-center gap-2 rounded-md border border-[#3f6ea5] bg-[#0c2342] px-3 text-[12px] font-medium text-[#7fd0ff]"
                      type="button"
                    >
                      <Shield size={14} />
                      Retention Access
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-green-700 text-sm">
                <div>
                  <p className="text-gray-500">Gender</p>
                  <p className="font-medium">{patient?.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500">Birthday</p>
                  <p className="font-medium">{patient?.birthday || patient?.age}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone Number</p>
                  <p className="font-medium">{patient?.phone}</p>
                </div>
              
                <div className="col-span-">
                  <p className="text-gray-500">Street Address</p>
                  <p className="font-medium text-xs">{patient?.address}</p>
                </div>
               
                
                <div>
                  <p className="text-gray-500">Registered Date</p>
                  <p className="font-medium">{patient?.registeredDate}</p>
                </div>
              </div>
            </div>

           
          </div>

          {/* Right Column - Appointments & Documents */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {['Upcoming Appointments', 'Past Appointments', 'Medical Records'].map((tab, i) => (
                <button 
                  key={i}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition ${i === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg">Upcoming Appointments</h3>
                <button className="text-blue-600 text-sm font-medium flex items-center gap-1">
                  Show Past Treatment <span className="text-xs">↓</span>
                </button>
              </div>

              <div className="space-y-6">
                {upcomingAppointments.map((appt, index) => (
                  <div key={index} className="flex gap-6 border-l-2 border-blue-500 pl-6 relative">
                    {index !== upcomingAppointments.length - 1 && (
                      <div className="absolute left-[11px] top-8 bottom-0 w-px bg-gray-200" />
                    )}
                    
                    <div className="w-20 flex-shrink-0">
                      <div className="text-sm font-medium text-gray-900">{appt.date}</div>
                      <div className="text-xs text-gray-500 mt-1">{appt.time}</div>
                    </div>

                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{appt.treatment}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {appt.doctor} • {appt.nurse}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        {appt.status}
                      </span>
                      <button className="p-2 hover:bg-gray-100 rounded-xl transition">
                        <Eye size={18} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;