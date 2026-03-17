import { useState } from "react";
import {
  createRecord,
  getPatientRecords,
  updateRecord,
} from "@/api/clinicalApi";

export const useClinicalRecords = (module) => {
  const [loading, setLoading] = useState(false);

  const create = async (data) => {
    setLoading(true);
    try {
      const res = await createRecord(module, data);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const getByPatient = async (patientId, params) => {
    setLoading(true);
    try {
      const res = await getPatientRecords(module, patientId, params);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data) => {
    setLoading(true);
    try {
      const res = await updateRecord(module, id, data);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    getByPatient,
    update,
    loading,
  };
};