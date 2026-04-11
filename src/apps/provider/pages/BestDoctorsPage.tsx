// BestDoctorsPage

import React, { useEffect, useState } from "react";
import {
  BriefcaseMedical,
  Loader2,
  Mail,
  Phone,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import AddDoctorModal from "@/apps/components/AddDoctorModal";
import { getDoctors } from "@/shared/utils/utilityFunction";
import { useAuth } from "@/shared/auth/AuthProvider";


type HospitalDoctor = {
  id: string;
  fullName: string;
  wrId?: string;
  specialty?: string;
  role?: string;
  email?: string;
  phone?: string;
};

export default function HospitalDoctorsMembershipPage() {
  const {user} = useAuth()
  const [doctors, setDoctors] = useState<HospitalDoctor[]>([]);
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);


  const fetchDoctors = async () => {
    console.log("🚀 ~ fetchDoctors ~ data:", "YYYYYYYYYYYYYYYYYYY")
    try {
      setLoading(true);

      const  data  = await getDoctors({});
      console.log(data)

      setDoctors(data?.data.doctors || []);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load hospital doctors",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleRemoveDoctor = async (doctorId: string) => {
    try {
      setRemovingId(doctorId);

      await axios.delete(`${API_BASE_URL}/memberships/doctors/${doctorId}`, {
        data: { doctorId },
        withCredentials: true,
      });

      setDoctors((prev) => prev.filter((doctor) => doctor.id !== doctorId));
      toast.success("Doctor removed from hospital membership");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to remove doctor",
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen b-[#07162b] bg-[#E6EFFC] px-6 py-10 text-blue-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-blue-900">
              Hospital Doctors
            </h1>
            <p className="mt-1 text-blue-900 font-bold">
              Manage doctors attached to your hospital membership
            </p>
          </div>

          <button
            onClick={() => setOpenAddModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-900 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-950"
          >
            <Plus className="h-5 w-5" />
            Add Doctor
          </button>
        </div>

        <div className="mb-6 text-base font-bold text-blue-900">
          {doctors?.length} doctor{doctors?.length !== 1 ? "s" : ""} in membership
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-blue-950/20">
            <div className="flex items-center gap-3 text-gray-300">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading doctors...
            </div>
          </div>
        ) : doctors?.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-blue- p-10 text-center">
            <p className="text-lg font-medium text-gray-200">
              No doctors added yet
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Click “Add Doctor” to search by WelliRecord ID, email, or phone.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors?.map((doctor) => (
              <div
                key={doctor.id}
                className="rounded-3xl border border-white/10 bg-blue-950 p-5 shadow-sm transition-all hover:shadow-xl"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#12355f]">
                      <UserRound className="h-7 w-7 text-[#dcecff]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">
                        {doctor.fullName}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {doctor.wrId || "No WR ID"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-100">
                  <div className="flex items-center gap-2">
                    <BriefcaseMedical className="h-4 w-4 text-gray-100" />
                    <span>{doctor.specialty || doctor.role || "Doctor"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{doctor.email || "No email"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{doctor.phone || "No phone"}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handleRemoveDoctor(doctor.id)}
                    disabled={removingId === doctor.id}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-70"
                  >
                    {removingId === doctor.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Remove Doctor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AddDoctorModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          hospitalId={user.sub}
          onDoctorAdded={() => {
            fetchDoctors();
          }}
        />
      </div>
    </div>
  );
}