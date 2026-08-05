import React from 'react';
import { FileImage } from 'lucide-react';

// No backend radiology/imaging-order model exists yet. The previous
// version showed a fake worklist and a "Publish Report & Confirm"
// button that claimed to save a report to the patient vault while
// persisting nothing at all. Honest placeholder until real imaging
// order tracking is built.
export function RadiologyPage() {
    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-xl font-black" style={{ color: '#e2e8f0' }}>Radiology Workspace</h1>
                <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>Upload reports and images · Confirm order completion</p>
            </div>

            <div className="rounded-2xl p-10 text-center max-w-lg flex flex-col items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(109,40,217,0.25)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(109,40,217,0.12)' }}>
                    <FileImage size={26} style={{ color: '#7c3aed' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>Radiology worklist isn't available yet</p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                    Imaging order tracking, DICOM upload, and report publishing need a dedicated backend model — none exists yet.
                </p>
            </div>
        </div>
    );
}
