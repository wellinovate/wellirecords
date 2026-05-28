import React, { useState } from "react";
import {
  X,
  Activity,
  Pill,
  AlertTriangle,
  FlaskConical,
  Stethoscope,
  Syringe,
} from "lucide-react";



interface FirstRecordWizardProps {
  onClose: () => void;
}

const RECORD_TYPES = [
  {
    id: "vitals",
    label: "Vitals",
    icon: Activity,
    color: "#ef4444",
    desc: "Ongoing diagnoses & management",
  },
  {
    id: "Prescription",
    label: "Medication",
    icon: Pill,
    color: "#8b5cf6",
    desc: "Medications & refills",
  },
  {
    id: "Allergy",
    label: "Allergy",
    icon: AlertTriangle,
    color: "#f97316",
    desc: "Drug, food & environmental allergies",
  },
  {
    id: "Dianosis",
    label: "Diagnosis",
    icon: FlaskConical,
    color: "#3b82f6",
    desc: "Blood work, urinalysis, pathology",
  },
  {
    id: "Procedures",
    label: "Procedures",
    icon: Stethoscope,
    color: "#1a6b42",
    desc: "Doctor visit summaries & SOAP notes",
  },
  {
    id: "Lab Result",
    label: "Lab Result",
    icon: FlaskConical,
    color: "#3b82f6",
    desc: "Blood work, urinalysis, pathology",
  },
  {
    id: "Vaccination",
    label: "Vaccination",
    icon: Syringe,
    color: "#f59e0b",
    desc: "Immunisation records & travel shots",
  },
];

export const FirstRecordWizard: React.FC<FirstRecordWizardProps> = ({ onClose }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (id: string) => {
    setSelectedType(id);
    setIsModalOpen(true);
  };

  return (
    <div>
      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {RECORD_TYPES.map(({ id, label, icon: Icon, color, desc }) => (
          <button
            key={id}
            onClick={() => handleClick(id)}
            className="text-left p-3 rounded-xl transition-all"
            style={{
              border: `2px solid ${selectedType === id ? color : 'rgba(0,0,0,0.08)'}`,
              background: selectedType === id ? `${color}0e` : '#fafafa',
            }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${color}18` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div className="font-semibold text-xs mb-0.5" style={{ color: '#1a2e1e' }}>{label}</div>
            <div className="text-[10px] leading-tight" style={{ color: '#9ca3af' }}>{desc}</div>
          </button>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && selectedType && (
        <RecordModal
          type={selectedType}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

// Modal Component
interface RecordModalProps {
  type: string;
  onClose: () => void;
}






interface RecordModalProps {
  type: string;
  onClose: () => void;
}


export const RecordModal: React.FC<RecordModalProps> = ({ type, onClose }) => {
  const record = RECORD_TYPES.find(r => r.id === type);

  if (!record) return null;

  // Dynamically render the corresponding form/component
  const renderContent = () => {
    switch (type) {
      case "vitals":
        return <VitalRecordForm />;
      case "Prescription":
        return <MedicationRecordForm />;
      case "Allergy":
        return <AllergyRecordForm />;
      case "Dianosis":
        return <DiagnosisRecordForm />;
      case "Procedures":
        return <ProcedureRecordForm />;
      case "Lab Result":
        return <LabResultRecordForm />;
      case "Vaccination":
        return <MedicalRecords filter="vaccination" />; // example: filter for vaccinations
      default:
        return <p>No content available</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto relative shadow-lg">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-900" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="flex items-center mb-4">
          <record.icon size={24} style={{ color: record.color }} />
          <h2 className="text-lg font-bold ml-2">{record.label}</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">{record.desc}</p>
        <div className="">{renderContent()}</div>
      </div>
    </div>
  );
};