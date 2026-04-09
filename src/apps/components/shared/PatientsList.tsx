import React from 'react';
import { Plus, Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const patients = [
  {
    id: 1,
    name: "Andrea Hiyakiya",
    gender: "Female",
    age: "25 yr",
    diagnosis: "Cancer",
    phone: "(280) 548-0124",
    address: "Nampa, Tennessee",
    blood: "O+",
    triage: "Non Urgent",
    avatar: "https://i.pravatar.cc/150?u=andrea1"
  },
  {
    id: 2,
    name: "Bianca Lalema",
    gender: "Female",
    age: "42 yr",
    diagnosis: "Heart attack",
    phone: "(124) 864-1794",
    address: "Nampa, Tennessee",
    blood: "AB+",
    triage: "Emergency",
    avatar: "https://i.pravatar.cc/150?u=bianca"
  },
  {
    id: 3,
    name: "John Smith",
    gender: "Male",
    age: "27 yr",
    diagnosis: "Cancer",
    phone: "(789) 164-4876",
    address: "San Francisco, Oregon",
    blood: "A+",
    triage: "Resuscitation",
    avatar: "https://i.pravatar.cc/150?u=john"
  },
  {
    id: 4,
    name: "Amalia Makhlong",
    gender: "Female",
    age: "25 yr",
    diagnosis: "Diabetes",
    phone: "(222) 544-8790",
    address: "Anchorage, Georgia",
    blood: "B+",
    triage: "Urgent",
    avatar: "https://i.pravatar.cc/150?u=amalia"
  },
  {
    id: 5,
    name: "Rizky Roge",
    gender: "Male",
    age: "30 yr",
    diagnosis: "Stroke",
    phone: "(135) 872-1460",
    address: "Graham, California",
    blood: "O+",
    triage: "Pass Away",
    avatar: "https://i.pravatar.cc/150?u=rizky"
  },
  // Add more patients as needed (I included the first 5 for brevity)
];

const triageColors: Record<string, string> = {
  "Non Urgent": "bg-emerald-100 text-emerald-700",
  "Emergency": "bg-red-100 text-red-700",
  "Resuscitation": "bg-blue-100 text-blue-700",
  "Urgent": "bg-amber-100 text-amber-700",
  "Pass Away": "bg-purple-100 text-purple-700",
};

export default function PatientsList() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Patients List</h1>
            <p className="text-gray-500 mt-1">Manage and monitor all registered patients</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-medium transition">
              <Plus size={20} />
              Add Doctor
            </button>

            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter</span>
            </div>

            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl px-3 py-2">
              <button className="p-1 hover:bg-gray-100 rounded-xl transition">
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 text-sm font-medium">Previous</span>
              <span className="px-4 text-sm font-medium">Next</span>
              <button className="p-1 hover:bg-gray-100 rounded-xl transition">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search patients by name, diagnosis, or phone..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Gender</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Age</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Diagnosis</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Phone Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Blood</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Triage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((patient) => (
                  <tr 
                    key={patient.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={patient.avatar} 
                          alt={patient.name}
                          className="w-9 h-9 rounded-2xl object-cover"
                        />
                        <span className="font-medium text-gray-900">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-gray-600">{patient.gender}</td>
                    <td className="px-6 py-5 text-gray-600">{patient.age}</td>
                    <td className="px-6 py-5 font-medium text-gray-700">{patient.diagnosis}</td>
                    <td className="px-6 py-5 text-gray-600 font-mono text-sm">{patient.phone}</td>
                    <td className="px-6 py-5 text-gray-600">{patient.address}</td>
                    <td className="px-6 py-5">
                      <span className="font-semibold text-gray-700">{patient.blood}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span 
                        className={`inline-block px-4 py-1.5 text-xs font-medium rounded-full ${triageColors[patient.triage] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {patient.triage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
          <p>Showing 1 to 10 of 48 patients</p>
          <div className="flex items-center gap-2">
            <span>Page 1 of 5</span>
          </div>
        </div>
      </div>
    </div>
  );
}