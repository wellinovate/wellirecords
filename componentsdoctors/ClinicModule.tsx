
import React, { useState } from 'react';
import { 
  Search, 
  User, 
  FileText, 
  Activity, 
  Thermometer, 
  Heart, 
  Wind,
  Plus,
  Share2,
  ChevronRight,
  AlertTriangle,
  Check,
  ShieldCheck,
  FileJson,
  AlertCircle,
  RefreshCw,
  Loader2,
  Filter,
  Copy,
  Calendar,
  MessageSquare,
  Skull,
  LayoutList,
  Rows,
  ArrowRight,
  Pill,
  Clock,
  MoreHorizontal,
  X
} from 'lucide-react';
import { Patient, ClinicalNote, VitalSign } from '../types';

// Extended Patient Type for UI logic
interface PatientUI extends Patient {
  visitStatus: 'checked-in' | 'active' | 'inactive';
  severeAllergies?: boolean;
}

const ClinicModule: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<PatientUI | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    dob: '',
    gender: 'M',
    bloodType: 'O+'
  });

  // Helper to calculate age
  const getAge = (dobString: string) => {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  // Expanded Mock Data moved to State
  const [patients, setPatients] = useState<PatientUI[]>([
    { id: '1', did: 'did:welli:39f28a...2a1', name: 'Michael Chen', dob: '1982-04-12', gender: 'M', bloodType: 'O+', allergies: ['Penicillin'], lastVisit: 'Today, 09:30 AM', status: 'active', visitStatus: 'checked-in', fhirCompliant: true, severeAllergies: true },
    { id: '2', did: 'did:welli:7a2b91...b99', name: 'Sarah Miller', dob: '1990-11-05', gender: 'F', bloodType: 'A+', allergies: ['None'], lastVisit: 'Oct 20, 2023', status: 'active', visitStatus: 'active', fhirCompliant: true },
    { id: '3', did: 'did:welli:1c4e82...e33', name: 'James Wilson', dob: '1955-08-30', gender: 'M', bloodType: 'B-', allergies: ['Peanuts', 'Sulfa'], lastVisit: 'Oct 01, 2023', status: 'active', visitStatus: 'active', fhirCompliant: false, severeAllergies: true },
    { id: '4', did: 'did:welli:8x9p21...k22', name: 'Elena Rodriguez', dob: '1975-03-15', gender: 'F', bloodType: 'AB+', allergies: ['Latex'], lastVisit: 'Sep 28, 2023', status: 'active', visitStatus: 'active', fhirCompliant: true },
    { id: '5', did: 'did:welli:5m2n81...j88', name: 'Robert Fox', dob: '1962-12-01', gender: 'M', bloodType: 'O-', allergies: ['None'], lastVisit: 'Sep 15, 2023', status: 'active', visitStatus: 'active', fhirCompliant: true },
    { id: '6', did: 'did:welli:2k9l11...h44', name: 'Emily Blunt', dob: '1988-07-22', gender: 'F', bloodType: 'A-', allergies: ['None'], lastVisit: 'Aug 30, 2023', status: 'archived', visitStatus: 'inactive', fhirCompliant: true },
    { id: '7', did: 'did:welli:9p1o22...g55', name: 'David Okafor', dob: '1995-02-14', gender: 'M', bloodType: 'O+', allergies: ['Dust'], lastVisit: 'Aug 12, 2023', status: 'active', visitStatus: 'active', fhirCompliant: true },
    { id: '8', did: 'did:welli:3j8k77...f66', name: 'Linda Kim', dob: '1950-05-30', gender: 'F', bloodType: 'B+', allergies: ['Shellfish'], lastVisit: 'Today, 08:00 AM', status: 'active', visitStatus: 'checked-in', fhirCompliant: true, severeAllergies: true },
    { id: '9', did: 'did:welli:4h7g66...d33', name: 'Marcus Johnson', dob: '2010-09-10', gender: 'M', bloodType: 'A+', allergies: ['None'], lastVisit: 'Jul 20, 2023', status: 'active', visitStatus: 'active', fhirCompliant: true },
    { id: '10', did: 'did:welli:1f2d33...s11', name: 'Sophie Turner', dob: '2015-11-20', gender: 'F', bloodType: 'O+', allergies: ['Amoxicillin'], lastVisit: 'Jul 15, 2023', status: 'active', visitStatus: 'active', fhirCompliant: false },
    { id: '11', did: 'did:welli:6a5s44...d22', name: 'William Brown', dob: '1945-01-01', gender: 'M', bloodType: 'AB-', allergies: ['None'], lastVisit: 'Jun 30, 2023', status: 'archived', visitStatus: 'inactive', fhirCompliant: true },
    { id: '12', did: 'did:welli:8u7y66...t55', name: 'Olivia Martinez', dob: '1992-06-18', gender: 'F', bloodType: 'A+', allergies: ['Bee Stings'], lastVisit: 'Jun 12, 2023', status: 'active', visitStatus: 'active', fhirCompliant: true, severeAllergies: true },
    { id: '13', did: 'did:welli:3r4e55...w44', name: 'Lucas Gray', dob: '2000-03-25', gender: 'M', bloodType: 'O-', allergies: ['None'], lastVisit: 'May 28, 2023', status: 'active', visitStatus: 'active', fhirCompliant: true },
    { id: '14', did: 'did:welli:9i8u77...q33', name: 'Isabella White', dob: '1985-08-08', gender: 'F', bloodType: 'B-', allergies: ['None'], lastVisit: 'May 15, 2023', status: 'active', visitStatus: 'active', fhirCompliant: true },
    { id: '15', did: 'did:welli:2o3p44...l11', name: 'Ethan Black', dob: '1978-12-12', gender: 'M', bloodType: 'A+', allergies: ['None'], lastVisit: 'May 01, 2023', status: 'active', visitStatus: 'active', fhirCompliant: true },
  ]);

  const vitals: VitalSign[] = [
    { type: 'heart_rate', value: '72', unit: 'bpm', timestamp: '10:42 AM', status: 'normal' },
    { type: 'blood_pressure', value: '120/80', unit: 'mmHg', timestamp: '10:42 AM', status: 'normal' },
    { type: 'temperature', value: '37.1', unit: '°C', timestamp: '10:42 AM', status: 'normal' },
    { type: 'sp02', value: '98', unit: '%', timestamp: '10:42 AM', status: 'normal' },
  ];

  const notes: ClinicalNote[] = [
    {
      id: 'note_1',
      date: 'Oct 24, 2023',
      provider: 'Dr. Sarah Chen',
      role: 'Cardiologist',
      type: 'visit',
      title: 'Routine Follow-up',
      content: 'Patient reports mild shortness of breath during exercise. ECG normal. Advised to continue current medication and increase daily activity gradually.',
      signedAt: '2023-10-24T10:45:00Z',
      signatureHash: '0x7f...3a29',
      verified: true,
      fhirCompliant: true
    },
    {
      id: 'note_2',
      date: 'Sep 15, 2023',
      provider: 'Dr. Emily Wong',
      role: 'General Practitioner',
      type: 'lab_order',
      title: 'Blood Work Request',
      content: 'CBC, Lipid Panel, HbA1c requested. Patient fasting for 12 hours.',
      signedAt: '2023-09-15T09:30:00Z',
      signatureHash: '0x9b...1c44',
      verified: true,
      fhirCompliant: false,
      fhirIssues: [
        'Missing LOINC code for "Lipid Panel" observation request',
        'ServiceRequest.subject reference format invalid'
      ]
    }
  ];

  const handleRunValidation = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
    }, 1500);
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatientData: PatientUI = {
        id: (patients.length + 1).toString(),
        did: 'did:welli:gen' + Math.floor(Math.random() * 1000000),
        name: newPatient.name,
        dob: newPatient.dob,
        gender: newPatient.gender,
        bloodType: newPatient.bloodType,
        allergies: ['None'],
        lastVisit: 'Just now',
        status: 'active',
        visitStatus: 'checked-in',
        fhirCompliant: true
    };
    
    setPatients([newPatientData, ...patients]);
    setIsAddPatientModalOpen(false);
    setNewPatient({ name: '', dob: '', gender: 'M', bloodType: 'O+' });
    setSelectedPatient(newPatientData); // Automatically open the new patient chart
  };

  const renderPatientSearch = () => (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-full">
      
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Patient Census</h2>
          <p className="text-slate-600 mt-1">Manage patient records, admissions, and daily workflow.</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                 <button 
                    onClick={() => setDensity('comfortable')}
                    className={`p-2 rounded ${density === 'comfortable' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Comfortable View"
                 >
                     <LayoutList className="w-4 h-4" />
                 </button>
                 <button 
                    onClick={() => setDensity('compact')}
                    className={`p-2 rounded ${density === 'compact' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Compact View"
                 >
                     <Rows className="w-4 h-4" />
                 </button>
             </div>
             <button 
                onClick={() => setIsAddPatientModalOpen(true)}
                className="px-4 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 flex items-center gap-2 transition-colors text-sm shadow-sm"
            >
                <Plus className="w-4 h-4" />
                New Patient
            </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Name, DOB, or MRN..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors text-xs">
                <Filter className="w-3.5 h-3.5" />
                Active Only
            </button>
            <button className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors text-xs">
                <Calendar className="w-3.5 h-3.5" />
                Today's Visits
            </button>
        </div>
      </div>

      {/* Patient List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-6 py-4 border-b border-slate-200 w-[25%]">Patient</th>
                        <th className="px-4 py-4 border-b border-slate-200 w-[15%]">Demographics</th>
                        <th className="px-4 py-4 border-b border-slate-200 w-[20%]">Patient ID</th>
                        <th className="px-4 py-4 border-b border-slate-200 w-[20%]">Alerts & Flags</th>
                        <th className="px-4 py-4 border-b border-slate-200 w-[10%]">Last Visit</th>
                        <th className="px-4 py-4 border-b border-slate-200 text-right w-[10%]">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {patients.map(patient => (
                        <tr 
                            key={patient.id} 
                            onClick={() => setSelectedPatient(patient)}
                            className={`
                                group cursor-pointer transition-colors hover:bg-slate-50
                                ${patient.visitStatus === 'checked-in' ? 'border-l-4 border-l-blue-500' : 
                                  patient.visitStatus === 'inactive' ? 'border-l-4 border-l-slate-300 bg-slate-50/50' : 
                                  'border-l-4 border-l-green-500'}
                            `}
                        >
                            {/* Patient Column */}
                            <td className={`px-6 ${density === 'compact' ? 'py-2' : 'py-4'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200 shadow-sm
                                        ${density === 'compact' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm bg-slate-100'}
                                    `}>
                                        {patient.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                            {patient.name}
                                            {patient.visitStatus === 'checked-in' && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wide">
                                                    Checked In
                                                </span>
                                            )}
                                            {patient.visitStatus === 'inactive' && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600 border border-slate-300 uppercase tracking-wide">
                                                    Archived
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* Demographics Column */}
                            <td className={`px-4 ${density === 'compact' ? 'py-2' : 'py-4'}`}>
                                <div className="flex items-center gap-3 text-sm text-slate-700">
                                    <span className="font-bold" title={`DOB: ${patient.dob}`}>{getAge(patient.dob)}y</span>
                                    <span className="text-slate-300">|</span>
                                    <span>{patient.gender}</span>
                                    <span className="text-slate-300">|</span>
                                    <span className="font-mono font-medium">{patient.bloodType}</span>
                                </div>
                            </td>

                            {/* ID Column */}
                            <td className={`px-4 ${density === 'compact' ? 'py-2' : 'py-4'}`}>
                                <div className="flex items-center gap-2 group/id">
                                    <span className="font-mono text-xs text-slate-500 truncate max-w-[140px]" title={patient.did}>
                                        {patient.did}
                                    </span>
                                    <button 
                                        onClick={(e) => copyToClipboard(patient.did, e)}
                                        className="text-slate-300 hover:text-blue-600 opacity-0 group-hover/id:opacity-100 transition-opacity"
                                        title="Copy ID"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </td>

                            {/* Alerts Column */}
                            <td className={`px-4 ${density === 'compact' ? 'py-2' : 'py-4'}`}>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {patient.allergies.map(a => {
                                        if (a === 'None') return <span key={a} className="text-xs text-slate-400">No Alerts</span>;
                                        
                                        const isSevere = patient.severeAllergies;
                                        return (
                                            <span key={a} className={`
                                                flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold border shadow-sm
                                                ${isSevere 
                                                    ? 'bg-red-50 text-red-700 border-red-200' 
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }
                                            `}>
                                                {isSevere ? <Skull className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                                {a}
                                            </span>
                                        );
                                    })}
                                    
                                    {/* Admin/Schema Flags (Demoted visually) */}
                                    {patient.fhirCompliant === false && (
                                        <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200" title="Schema Validation Error">
                                            <FileJson className="w-3 h-3" /> Schema
                                        </span>
                                    )}
                                </div>
                            </td>

                            {/* Last Visit */}
                            <td className={`px-4 ${density === 'compact' ? 'py-2' : 'py-4'} text-sm text-slate-600`}>
                                {patient.lastVisit}
                            </td>

                            {/* Actions */}
                            <td className={`px-4 ${density === 'compact' ? 'py-2' : 'py-4'} text-right`}>
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="View Chart"
                                        onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); }}
                                    >
                                        <FileText className="w-4 h-4" />
                                    </button>
                                    <button 
                                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                                        title="Schedule Appointment"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                    <button 
                                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                        title="Send Message"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {/* Table Footer */}
        <div className="border-t border-slate-200 p-3 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
            <div>Showing {patients.length} patients</div>
            <div className="flex gap-2">
                <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">Next</button>
            </div>
        </div>
      </div>

      {/* ADD PATIENT MODAL */}
      {isAddPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Register New Patient</h3>
                    <button onClick={() => setIsAddPatientModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleAddPatient} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="e.g. John Doe"
                            value={newPatient.name}
                            onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Date of Birth</label>
                        <input 
                            type="date" 
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={newPatient.dob}
                            onChange={(e) => setNewPatient({...newPatient, dob: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Gender</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={newPatient.gender}
                                onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Blood Type</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={newPatient.bloodType}
                                onChange={(e) => setNewPatient({...newPatient, bloodType: e.target.value})}
                            >
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsAddPatientModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                        >
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );

  const renderPatientDetail = (patient: PatientUI) => (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <button 
            onClick={() => setSelectedPatient(null)}
            className="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors"
        >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Census
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-900 font-semibold">{patient.name}</span>
      </div>

      {/* Clinical Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                      <User className="w-8 h-8" />
                  </div>
                  <div>
                      <h1 className="text-2xl font-bold text-slate-900 leading-tight">{patient.name}</h1>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                          <span className="font-medium">DOB: {patient.dob} ({getAge(patient.dob)}y)</span>
                          <span className="text-slate-300">|</span>
                          <span>{patient.gender}</span>
                          <span className="text-slate-300">|</span>
                          <span>Blood: <span className="font-bold text-slate-900">{patient.bloodType}</span></span>
                      </div>
                      <div className="mt-2 flex gap-2">
                           <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded flex items-center gap-1">
                                <Check className="w-3 h-3" /> Verified Identity
                           </span>
                           {patient.fhirCompliant !== false ? (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded flex items-center gap-1">
                                    <FileJson className="w-3 h-3" /> FHIR R4
                                </span>
                           ) : (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Schema Issue
                                </span>
                           )}
                      </div>
                  </div>
              </div>
              
              <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded hover:bg-slate-50 transition-colors text-sm shadow-sm">
                      Manage Consent
                  </button>
                  <button className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded transition-colors text-sm shadow-sm flex items-center gap-2">
                      <Plus className="w-4 h-4" /> New Encounter
                  </button>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* Vitals Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vitals.map((vital, idx) => {
                    const icons = {
                        heart_rate: Heart,
                        blood_pressure: Activity,
                        temperature: Thermometer,
                        sp02: Wind,
                        weight: Activity
                    };
                    const Icon = icons[vital.type] || Activity;
                    return (
                        <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-1 text-slate-500">
                                <Icon className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">{vital.type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-slate-900">{vital.value}</span>
                                <span className="text-xs text-slate-500 font-medium">{vital.unit}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Clinical Notes Section */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Clinical Documentation
                    </h3>
                    <div className="flex gap-2">
                        <button className="text-xs font-medium text-slate-600 hover:text-blue-700 border border-slate-300 bg-white px-2 py-1 rounded">Filter</button>
                    </div>
                </div>

                {/* Validation Banner (Cleaner) */}
                {notes.some(n => !n.fhirCompliant) && (
                    <div className="bg-amber-50 px-4 py-3 border-b border-amber-200 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-amber-900">FHIR Validation Warning</p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Some records do not conform to FHIR R4 standards. Interoperability may be limited.
                            </p>
                        </div>
                        <button className="text-xs font-bold text-amber-800 underline hover:text-amber-900">Review Issues</button>
                    </div>
                )}

                <div className="divide-y divide-slate-100">
                    {notes.map(note => (
                        <div key={note.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <h4 className="font-bold text-slate-900 text-base">{note.title}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                        note.type === 'visit' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        note.type === 'lab_order' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {note.type.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-500">{note.date}</div>
                            </div>

                            <p className="text-slate-800 text-sm leading-relaxed mb-4">{note.content}</p>
                            
                            {/* Validation Errors Box */}
                            {!note.fhirCompliant && note.fhirIssues && (
                                <div className="mt-3 mb-4 p-3 bg-red-50 rounded border border-red-100">
                                    <h5 className="text-xs font-bold text-red-800 flex items-center gap-1.5 mb-1.5">
                                        <AlertCircle className="w-3.5 h-3.5" /> Schema Validation Errors
                                    </h5>
                                    <ul className="list-disc list-inside text-xs text-red-700 space-y-1 ml-1">
                                        {note.fhirIssues.map((issue, i) => (
                                            <li key={i}>{issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="font-bold text-slate-700">{note.provider}</span>
                                    <span className="text-slate-400">|</span>
                                    <span className="text-slate-500">{note.role}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {note.fhirCompliant ? (
                                        <div className="flex items-center gap-1 text-green-700 text-[10px] font-bold uppercase">
                                            <ShieldCheck className="w-3 h-3" /> Valid
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-red-700 text-[10px] font-bold uppercase">
                                            <AlertTriangle className="w-3 h-3" /> Invalid
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Sidebar: Context & Actions */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Actions (Clean List) */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <h3 className="font-bold text-slate-900 text-sm mb-3">Quick Actions</h3>
                <div className="space-y-2">
                    <button className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 rounded text-sm font-medium text-slate-700 flex items-center gap-2 transition-colors">
                        <Pill className="w-4 h-4 text-slate-500" /> ePrescribe Medication
                    </button>
                    <button className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 rounded text-sm font-medium text-slate-700 flex items-center gap-2 transition-colors">
                        <Activity className="w-4 h-4 text-slate-500" /> Order Lab Tests
                    </button>
                    <button className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 rounded text-sm font-medium text-slate-700 flex items-center gap-2 transition-colors">
                        <Share2 className="w-4 h-4 text-slate-500" /> Generate Referral
                    </button>
                </div>
            </div>

            {/* Allergies Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Allergies & Alerts
                </h3>
                <div className="flex flex-wrap gap-2">
                    {patient.allergies.map(allergy => (
                        <span key={allergy} className={`px-3 py-1.5 rounded text-sm font-bold border ${
                            allergy === 'None'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}>
                            {allergy}
                        </span>
                    ))}
                    {patient.allergies.length === 0 && <span className="text-slate-500 text-sm">No known allergies</span>}
                </div>
            </div>

            {/* FHIR Status */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                 <div className="flex justify-between items-center mb-3">
                     <h3 className="font-bold text-slate-900 text-sm">Interoperability</h3>
                     {isValidating && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Patient Resource</span>
                        {patient.fhirCompliant !== false ? (
                             <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">PASS</span>
                        ) : (
                             <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">WARN</span>
                        )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Clinical Notes</span>
                        {notes.some(n => !n.fhirCompliant) ? (
                             <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">FAIL ({notes.filter(n => !n.fhirCompliant).length})</span>
                        ) : (
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">PASS</span>
                        )}
                    </div>
                 </div>
                 
                 <button 
                    onClick={handleRunValidation}
                    className="w-full mt-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2"
                 >
                     <RefreshCw className="w-3 h-3" /> Re-validate Schema
                 </button>
            </div>
            
            {/* Access Log */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                 <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-3">Access Audit</h3>
                 <div className="space-y-3">
                    <div className="flex gap-3 text-xs">
                        <div className="text-slate-400 font-mono">10:45 AM</div>
                        <div className="text-slate-600">Access by <span className="font-semibold text-slate-800">Dr. Sarah Chen</span></div>
                    </div>
                    <div className="flex gap-3 text-xs">
                        <div className="text-slate-400 font-mono">10:42 AM</div>
                        <div className="text-slate-600">Vitals write from <span className="font-semibold text-slate-800">Device #492</span></div>
                    </div>
                 </div>
            </div>

        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 h-full bg-slate-50/50 flex flex-col">
      {selectedPatient ? renderPatientDetail(selectedPatient) : renderPatientSearch()}
    </div>
  );
};

export default ClinicModule;
