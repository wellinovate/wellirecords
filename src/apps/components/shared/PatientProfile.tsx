import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  FileText, 
  MessageCircle, 
  Plus, 
  Eye, 
  Shield,
  Loader2
} from 'lucide-react';
import { health_companion_image } from '@/assets';

const PatientProfile = ({patient}: any) => {
 const [loading, setLoading] = useState(true);
 const tabs = ["Upcoming Appointments", "Past Appointments", "Medical Records"];
const [activeTab, setActiveTab] = useState("Upcoming Appointments");

  useEffect(() => {
    if (patient) {
      setLoading(false);
    }
  }, [patient]);

  const upcomingAppointments = [
  {
    date: "26 Nov '19",
    time: "09:00 - 10:00",
    treatment: "Root Canal Treatment",
    doctor: "Dr. Adam H.",
    nurse: "Jessicamo",
    status: "Open Access",
  },
  {
    date: "12 Dec '19",
    time: "08:00 - 09:00",
    treatment: "Root Canal prep",
    doctor: "Dr. Adam H.",
    nurse: "Jessicamo",
    status: "Open Access",
  },
];

const pastAppointments = [
  {
    date: "10 Oct '19",
    time: "11:00 - 12:00",
    treatment: "Tooth Extraction",
    doctor: "Dr. Sarah K.",
    nurse: "Martha",
    status: "Completed",
  },
  {
    date: "02 Sep '19",
    time: "01:00 - 02:00",
    treatment: "Dental Cleaning",
    doctor: "Dr. James T.",
    nurse: "Grace",
    status: "Completed",
  },
];

const medicalRecords = [
  {
    title: "Blood Pressure Check",
    date: "14 Jan '20",
    type: "Vital Record",
    clinician: "Nurse Anita",
    status: "Recorded",
  },
  {
    title: "Malaria Diagnosis",
    date: "20 Feb '20",
    type: "Diagnosis",
    clinician: "Dr. Bello",
    status: "Reviewed",
  },
];

  


 

  

  return (
  <div
    className="min-h-auto p-5 rounded-2xl"
    style={{
      background:
        "radial-gradient(circle at 72% 18%, rgba(116,167,255,0.08) 0%, rgba(116,167,255,0.02) 22%, transparent 40%), linear-gradient(180deg, #0B1730 0%, #091427 100%)",
      border: "1px solid rgba(120,150,255,0.08)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
    }}
  >
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#F3F7FF]">
            Patient Profile
          </h1>
          <p className="text-[#93A9C8]">
            Manage patient records and information
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition"
            style={{
              color: "#DFF7EA",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <MessageCircle size={18} />
            Send Message
          </button>

          <button
            className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl transition"
            style={{
              background:
                "linear-gradient(135deg, #2E6BFF 0%, #4D8DFF 45%, #2B72E8 100%)",
              border: "1px solid rgba(138,177,255,0.30)",
              boxShadow:
                "0 8px 20px rgba(27,71,180,0.35), inset 0 1px 0 rgba(255,255,255,0.10)",
            }}
          >
            <Plus size={18} />
            New Appointment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Patient Info */}
        <div className="lg:col-span-4 space-y-6">
          <div
            className="rounded-3xl p-6"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(132,182,255,0.07) 0%, rgba(132,182,255,0.02) 30%, transparent 55%), linear-gradient(180deg, #101B33 0%, #0B162B 100%)",
              border: "1px solid rgba(132,162,255,0.10)",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >

            {loading ? (<div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-400" size={32} />
          <p className="text-[#9FB3CF] text-sm">Loading patient profile...</p>
        </div>)  : patient ? 
        (
          <>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={patient?.avatar || health_companion_image}
                alt={patient?.fullName || ""}
                className="w-24 h-24 rounded-2xl object-cover shadow"
                style={{
                  border: "2px solid rgba(255,255,255,0.10)",
                }}
              />

              <div>
                <h2 className="text-xl font-semibold text-[#F4F7FF]">
                  {patient?.fullName}
                </h2>

                <h2 className="text-xs font-medium text-[#B9C8DF]">
                  {patient?.email}
                </h2>

                <div>
                  {patient?.wrId && (
                    <span className="text-[14px] font-bold text-[#F4F7FF]">
                      {patient?.wrId}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <button
                    className="inline-flex h-8 items-center gap-2 rounded-md px-3 text-[12px] font-medium"
                    type="button"
                    style={{
                      border: "1px solid rgba(95,145,220,0.45)",
                      background:
                        "linear-gradient(180deg, #173964 0%, #112E52 100%)",
                      color: "#C8ECFF",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    <Shield size={14} />
                    Retention Access
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-[#8EA3C2]">Gender</p>
                <p className="font-medium text-[#E8F2FF]">{patient?.gender}</p>
              </div>

              {/* <div>
                <p className="text-[#8EA3C2]">Birthday</p>
                <p className="font-medium text-[#E8F2FF]">
                  {patient?.birthday || patient?.age}
                </p>
              </div> */}

              <div>
                <p className="text-[#8EA3C2]">Phone Number</p>
                <p className="font-medium text-[#E8F2FF]">{patient?.phone}</p>
              </div>

              <div>
                <p className="text-[#8EA3C2]">Street Address</p>
                <p className="font-medium text-xs text-[#E8F2FF]">
                  {patient?.address}
                </p>
              </div>

              <div>
                <p className="text-[#8EA3C2]">Registered Date</p>
                <p className="font-medium text-[#E8F2FF]">
                  {patient?.registered}
                </p>
              </div>
            </div>
          </>

        ) :(
          <div className="flex items-center justify-center h-[400px]">
        <p className="text-[#9FB3CF]">No patient data found</p>
      </div>
        )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          <div
            className="flex border-b"
            style={{ borderColor: "rgba(132,162,255,0.10)" }}
          >
            {tabs.map((tab) => (
  <button
    key={tab}
    onClick={() => setActiveTab(tab)}
    className="px-6 py-4 font-medium text-sm border-b-2 transition"
    style={
      activeTab === tab
        ? {
            borderColor: "#3EA3FF",
            color: "#EAF5FF",
          }
        : {
            borderColor: "transparent",
            color: "#94A8C5",
          }
    }
  >
    {tab}
  </button>
))}
          </div>

          <div
            className="rounded-3xl p-6"
            style={{
              background:
                "radial-gradient(circle at 50% 30%, rgba(132,182,255,0.06) 0%, rgba(132,182,255,0.015) 35%, transparent 65%), linear-gradient(180deg, #101B33 0%, #0B162B 100%)",
              border: "1px solid rgba(132,162,255,0.10)",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <div className="flex justify-between items-center mb-6">
             <h3 className="font-semibold text-lg text-[#F3F7FF]">
  {activeTab}
</h3>

              <button className="text-[#B9D8FF] text-sm font-medium flex items-center gap-1">
                Show Past Treatment <span className="text-xs">↓</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-4">
  {activeTab === "Upcoming Appointments" &&
    upcomingAppointments.map((appt, index) => (
      <div
        key={index}
        className="flex gap-6 pl-6 relative rounded-2xl p-4"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,34,63,0.96) 0%, rgba(14,26,50,0.96) 100%)",
          border: "1px solid rgba(98,134,220,0.12)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div
          className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
          style={{
            background:
              "linear-gradient(180deg, #19C2FF 0%, #1C6DFF 100%)",
          }}
        />

        <div className="w-24 flex-shrink-0">
          <div className="text-sm font-medium text-[#F3F7FF]">{appt.date}</div>
          <div className="text-xs text-[#94A8C5] mt-1">{appt.time}</div>
        </div>

        <div className="flex-1">
          <div className="font-medium text-[#F3F7FF]">{appt.treatment}</div>
          <div className="text-sm text-[#9FB3CF] mt-1">
            {appt.doctor} • {appt.nurse}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="px-4 py-1.5 text-xs font-medium rounded-full"
            style={{
              background:
                "linear-gradient(180deg, #2F6EA0 0%, #255985 100%)",
              color: "#E9F7FF",
              border: "1px solid rgba(110,181,255,0.18)",
            }}
          >
            {appt.status}
          </span>

          <button
            className="p-2 rounded-xl transition"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Eye size={18} className="text-[#93A9C8]" />
          </button>
        </div>
      </div>
    ))}

  {activeTab === "Past Appointments" &&
    pastAppointments.map((appt, index) => (
      <div
        key={index}
        className="flex gap-6 pl-6 relative rounded-2xl p-4"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,34,63,0.96) 0%, rgba(14,26,50,0.96) 100%)",
          border: "1px solid rgba(98,134,220,0.12)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div
          className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
          style={{
            background:
              "linear-gradient(180deg, #7B8BAA 0%, #51627F 100%)",
          }}
        />

        <div className="w-24 flex-shrink-0">
          <div className="text-sm font-medium text-[#F3F7FF]">{appt.date}</div>
          <div className="text-xs text-[#94A8C5] mt-1">{appt.time}</div>
        </div>

        <div className="flex-1">
          <div className="font-medium text-[#F3F7FF]">{appt.treatment}</div>
          <div className="text-sm text-[#9FB3CF] mt-1">
            {appt.doctor} • {appt.nurse}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="px-4 py-1.5 text-xs font-medium rounded-full"
            style={{
              background:
                "linear-gradient(180deg, #355C4B 0%, #27463A 100%)",
              color: "#E9FFF4",
              border: "1px solid rgba(110,255,181,0.18)",
            }}
          >
            {appt.status}
          </span>

          <button
            className="p-2 rounded-xl transition"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Eye size={18} className="text-[#93A9C8]" />
          </button>
        </div>
      </div>
    ))}

  {activeTab === "Medical Records" &&
    medicalRecords.map((record, index) => (
      <div
        key={index}
        className="flex gap-6 pl-6 relative rounded-2xl p-4"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,34,63,0.96) 0%, rgba(14,26,50,0.96) 100%)",
          border: "1px solid rgba(98,134,220,0.12)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div
          className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
          style={{
            background:
              "linear-gradient(180deg, #A855F7 0%, #6D28D9 100%)",
          }}
        />

        <div className="w-24 flex-shrink-0">
          <div className="text-sm font-medium text-[#F3F7FF]">{record.date}</div>
          <div className="text-xs text-[#94A8C5] mt-1">{record.type}</div>
        </div>

        <div className="flex-1">
          <div className="font-medium text-[#F3F7FF]">{record.title}</div>
          <div className="text-sm text-[#9FB3CF] mt-1">{record.clinician}</div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="px-4 py-1.5 text-xs font-medium rounded-full"
            style={{
              background:
                "linear-gradient(180deg, #5B3D91 0%, #412B68 100%)",
              color: "#F3E8FF",
              border: "1px solid rgba(200,150,255,0.18)",
            }}
          >
            {record.status}
          </span>

          <button
            className="p-2 rounded-xl transition"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Eye size={18} className="text-[#93A9C8]" />
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
  </div>
);
};

export default PatientProfile;