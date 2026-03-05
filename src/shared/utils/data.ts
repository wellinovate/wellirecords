import { Baby, Brain, Heart, Stethoscope } from "lucide-react";
import { Activity } from "react";

// export const backendApi = process.env.BACKENDURL || "http://localhost:3000";
// export const backendApi: string = "http://localhost:3000";
export const backendApi: string = "https://wellirecord.onrender.com";


// --- Types ---
export interface Review {
  author: string;
  comment: string;
  rating: number;
  date: string;
}

export interface Provider {
  id: string;
  name: string;
  role: string;
  credentials: string; // e.g., "MD, Board Certified"
  specialty: string;
  subSpecialties: string[];
  experience: string;
  rating: number;
  reviewCount: number;
  price: number;
  nextAvailable: string;
  image: string;
  reviewSnippet: string;
  reviews: Review[];
  insurance: string[];
  isOnline: boolean;
}

export const PROVIDER: Provider[] = [
  {
    id: 'dr-chen',
    name: 'Dr. Sarah Chen',
    role: 'Doctor',
    credentials: 'MD, PhD • Harvard Medical',
    specialty: 'General Practice',
    subSpecialties: ['Preventive Care', 'Diabetes Mgmt'],
    experience: '12 Years Exp.',
    rating: 4.9,
    reviewCount: 128,
    price: 50,
    nextAvailable: 'Today, 2:30 PM',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200',
    reviewSnippet: "Dr. Chen actually listens. She explained my blood work in a way I could understand.",
    reviews: [
        { author: "Mark T.", comment: "Dr. Chen actually listens. She explained my blood work in a way I could understand.", rating: 5, date: "2 days ago" },
        { author: "Lisa K.", comment: "Best GP I've ever had. Very thorough.", rating: 5, date: "1 week ago" },
        { author: "James R.", comment: "Prompt and professional service.", rating: 4, date: "3 weeks ago" }
    ],
    insurance: ['BlueCross', 'Aetna', 'Medicare'],
    isOnline: true
  },
  {
    id: 'dr-ross',
    name: 'Dr. Michael Ross',
    role: 'Specialist',
    credentials: 'MD • Cardiology Fellow',
    specialty: 'Cardiology',
    subSpecialties: ['Hypertension', 'Heart Rhythm'],
    experience: '18 Years Exp.',
    rating: 4.8,
    reviewCount: 94,
    price: 120,
    nextAvailable: 'Tomorrow, 9:00 AM',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200',
    reviewSnippet: "Very thorough and reassuring. Caught an issue my previous doctor missed.",
    reviews: [
        { author: "Amanda B.", comment: "Very thorough and reassuring. Caught an issue my previous doctor missed.", rating: 5, date: "1 month ago" },
        { author: "Robert L.", comment: "Excellent cardiologist. Takes time to explain.", rating: 5, date: "2 months ago" }
    ],
    insurance: ['Cigna', 'United', 'PPO'],
    isOnline: false
  },
  {
    id: 'ph-miles',
    name: 'Linda Miles',
    role: 'Pharmacist',
    credentials: 'PharmD • Clinical Rx',
    specialty: 'Medication Mgmt',
    subSpecialties: ['Interactions', 'Dosage Review'],
    experience: '8 Years Exp.',
    rating: 5.0,
    reviewCount: 42,
    price: 25,
    nextAvailable: 'Today, 4:15 PM',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200',
    reviewSnippet: "Helped me sort out my complex medication schedule. A lifesaver!",
    reviews: [
        { author: "Patricia W.", comment: "Helped me sort out my complex medication schedule. A lifesaver!", rating: 5, date: "5 days ago" },
        { author: "Tom H.", comment: "Great advice on side effects.", rating: 5, date: "2 weeks ago" }
    ],
    insurance: ['Universal', 'Cash'],
    isOnline: true
  },
  {
    id: 'dr-patel',
    name: 'Dr. Anika Patel',
    role: 'Specialist',
    credentials: 'MD • Dermatology',
    specialty: 'Dermatology',
    subSpecialties: ['Acne', 'Eczema', 'Skin Cancer Screening'],
    experience: '10 Years Exp.',
    rating: 4.9,
    reviewCount: 215,
    price: 95,
    nextAvailable: 'Today, 3:00 PM',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200',
    reviewSnippet: "Cleared up my skin issue in two visits. Virtual diagnosis was spot on.",
    reviews: [
        { author: "Emily S.", comment: "Cleared up my skin issue in two visits. Virtual diagnosis was spot on.", rating: 5, date: "3 days ago" },
        { author: "David M.", comment: "Very kind and efficient.", rating: 4, date: "1 month ago" }
    ],
    insurance: ['BlueCross', 'United'],
    isOnline: true
  },
  {
    id: 'dr-williams',
    name: 'Dr. James Williams',
    role: 'Therapist',
    credentials: 'PhD • Clinical Psych',
    specialty: 'Mental Health',
    subSpecialties: ['Anxiety', 'Depression', 'Stress'],
    experience: '15 Years Exp.',
    rating: 4.7,
    reviewCount: 88,
    price: 80,
    nextAvailable: 'Fri, 10:00 AM',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200',
    reviewSnippet: "James is incredibly empathetic and gives great practical advice.",
    reviews: [
        { author: "Anon", comment: "James is incredibly empathetic and gives great practical advice.", rating: 5, date: "1 week ago" },
        { author: "Sarah P.", comment: "Helped me through a tough time.", rating: 5, date: "2 months ago" }
    ],
    insurance: ['Aetna', 'Cigna'],
    isOnline: false
  }
];

 export const SPECIALTIES = [
  { id: 'general', label: 'General Care', icon: Stethoscope, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'cardio', label: 'Heart Health', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'mental', label: 'Mental Health', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'peds', label: 'Pediatrics', icon: Baby, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'derm', label: 'Dermatology', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];



























































export const PROVIDERS: Provider[] = [
  {
    id: "dr-chen",
    name: "Dr. Sarah Chen",
    role: "Doctor",
    credentials: "MD, PhD • Harvard Medical",
    specialty: "General Practice",
    subSpecialties: ["Preventive Care", "Diabetes Mgmt"],
    experience: "12 Years Exp.",
    rating: 4.9,
    reviewCount: 128,
    price: 50,
    nextAvailable: "Today, 2:30 PM",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Dr. Chen actually listens. She explained my blood work in a way I could understand.",
    reviews: [
      {
        author: "Mark T.",
        comment:
          "Dr. Chen actually listens. She explained my blood work in a way I could understand.",
        rating: 5,
        date: "2 days ago",
      },
      {
        author: "Lisa K.",
        comment: "Best GP I've ever had. Very thorough.",
        rating: 5,
        date: "1 week ago",
      },
      {
        author: "James R.",
        comment: "Prompt and professional service.",
        rating: 4,
        date: "3 weeks ago",
      },
    ],
    insurance: ["BlueCross", "Aetna", "Medicare"],
    isOnline: true,
  },
  {
    id: "dr-ross",
    name: "Dr. Michael Ross",
    role: "Specialist",
    credentials: "MD • Cardiology Fellow",
    specialty: "Cardiology",
    subSpecialties: ["Hypertension", "Heart Rhythm"],
    experience: "18 Years Exp.",
    rating: 4.8,
    reviewCount: 94,
    price: 120,
    nextAvailable: "Tomorrow, 9:00 AM",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Very thorough and reassuring. Caught an issue my previous doctor missed.",
    reviews: [
      {
        author: "Amanda B.",
        comment:
          "Very thorough and reassuring. Caught an issue my previous doctor missed.",
        rating: 5,
        date: "1 month ago",
      },
      {
        author: "Robert L.",
        comment: "Excellent cardiologist. Takes time to explain.",
        rating: 5,
        date: "2 months ago",
      },
    ],
    insurance: ["Cigna", "United", "PPO"],
    isOnline: false,
  },
  {
    id: "ph-miles",
    name: "Linda Miles",
    role: "Pharmacist",
    credentials: "PharmD • Clinical Rx",
    specialty: "Medication Mgmt",
    subSpecialties: ["Interactions", "Dosage Review"],
    experience: "8 Years Exp.",
    rating: 5.0,
    reviewCount: 42,
    price: 25,
    nextAvailable: "Today, 4:15 PM",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Helped me sort out my complex medication schedule. A lifesaver!",
    reviews: [
      {
        author: "Patricia W.",
        comment:
          "Helped me sort out my complex medication schedule. A lifesaver!",
        rating: 5,
        date: "5 days ago",
      },
      {
        author: "Tom H.",
        comment: "Great advice on side effects.",
        rating: 5,
        date: "2 weeks ago",
      },
    ],
    insurance: ["Universal", "Cash"],
    isOnline: true,
  },
  {
    id: "dr-patel",
    name: "Dr. Anika Patel",
    role: "Specialist",
    credentials: "MD • Dermatology",
    specialty: "Dermatology",
    subSpecialties: ["Acne", "Eczema", "Skin Cancer Screening"],
    experience: "10 Years Exp.",
    rating: 4.9,
    reviewCount: 215,
    price: 95,
    nextAvailable: "Today, 3:00 PM",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Cleared up my skin issue in two visits. Virtual diagnosis was spot on.",
    reviews: [
      {
        author: "Emily S.",
        comment:
          "Cleared up my skin issue in two visits. Virtual diagnosis was spot on.",
        rating: 5,
        date: "3 days ago",
      },
      {
        author: "David M.",
        comment: "Very kind and efficient.",
        rating: 4,
        date: "1 month ago",
      },
    ],
    insurance: ["BlueCross", "United"],
    isOnline: true,
  },
  {
    id: "dr-williams",
    name: "Dr. James Williams",
    role: "Therapist",
    credentials: "PhD • Clinical Psych",
    specialty: "Mental Health",
    subSpecialties: ["Anxiety", "Depression", "Stress"],
    experience: "15 Years Exp.",
    rating: 4.7,
    reviewCount: 88,
    price: 80,
    nextAvailable: "Fri, 10:00 AM",
    image:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "James is incredibly empathetic and gives great practical advice.",
    reviews: [
      {
        author: "Anon",
        comment:
          "James is incredibly empathetic and gives great practical advice.",
        rating: 5,
        date: "1 week ago",
      },
      {
        author: "Sarah P.",
        comment: "Helped me through a tough time.",
        rating: 5,
        date: "2 months ago",
      },
    ],
    insurance: ["Aetna", "Cigna"],
    isOnline: false,
  },

  // --- Added 15 more (total 20) ---

  {
    id: "dr-okafor",
    name: "Dr. Chinedu Okafor",
    role: "Doctor",
    credentials: "MBBS • Family Medicine",
    specialty: "General Practice",
    subSpecialties: ["Preventive Care", "Men's Health"],
    experience: "9 Years Exp.",
    rating: 4.8,
    reviewCount: 76,
    price: 45,
    nextAvailable: "Today, 6:10 PM",
    image:
      "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Straight to the point but caring. Helped me fix my BP routine quickly.",
    reviews: [
      {
        author: "Ife O.",
        comment:
          "Straight to the point but caring. Helped me fix my BP routine quickly.",
        rating: 5,
        date: "4 days ago",
      },
      {
        author: "Ken A.",
        comment: "Clear plan and easy follow-up.",
        rating: 5,
        date: "2 weeks ago",
      },
    ],
    insurance: ["Aetna", "United", "Cash"],
    isOnline: true,
  },
  {
    id: "dr-garcia",
    name: "Dr. Elena Garcia",
    role: "Specialist",
    credentials: "MD • Endocrinology",
    specialty: "Endocrinology",
    subSpecialties: ["Thyroid", "Diabetes Mgmt"],
    experience: "14 Years Exp.",
    rating: 4.9,
    reviewCount: 167,
    price: 110,
    nextAvailable: "Tomorrow, 11:30 AM",
    image:
      "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Explained my thyroid labs clearly and adjusted meds without drama.",
    reviews: [
      {
        author: "Nora J.",
        comment:
          "Explained my thyroid labs clearly and adjusted meds without drama.",
        rating: 5,
        date: "6 days ago",
      },
      {
        author: "Paul D.",
        comment: "Very detailed and patient.",
        rating: 5,
        date: "1 month ago",
      },
    ],
    insurance: ["Cigna", "BlueCross"],
    isOnline: false,
  },
  {
    id: "dr-hassan",
    name: "Dr. Amina Hassan",
    role: "Specialist",
    credentials: "MD • Pediatrics",
    specialty: "Pediatrics",
    subSpecialties: ["Newborn Care", "Vaccines"],
    experience: "11 Years Exp.",
    rating: 4.9,
    reviewCount: 204,
    price: 70,
    nextAvailable: "Today, 5:20 PM",
    image:
      "https://images.unsplash.com/photo-1551601651-05c5b9a2b6e2?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "So gentle with kids. Our toddler actually enjoyed the call!",
    reviews: [
      {
        author: "Fatima S.",
        comment:
          "So gentle with kids. Our toddler actually enjoyed the call!",
        rating: 5,
        date: "1 week ago",
      },
      {
        author: "Chris M.",
        comment: "Great vaccine schedule guidance.",
        rating: 5,
        date: "3 weeks ago",
      },
    ],
    insurance: ["Medicare", "United", "PPO"],
    isOnline: true,
  },
  {
    id: "dr-adebayo",
    name: "Dr. Tunde Adebayo",
    role: "Specialist",
    credentials: "MD • Orthopedics",
    specialty: "Orthopedics",
    subSpecialties: ["Sports Injury", "Back Pain"],
    experience: "16 Years Exp.",
    rating: 4.7,
    reviewCount: 119,
    price: 130,
    nextAvailable: "Mon, 1:00 PM",
    image:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Gave a rehab plan that actually worked. No unnecessary scans.",
    reviews: [
      {
        author: "Dayo K.",
        comment:
          "Gave a rehab plan that actually worked. No unnecessary scans.",
        rating: 5,
        date: "2 weeks ago",
      },
      {
        author: "Megan R.",
        comment: "Helpful, practical stretching routine.",
        rating: 4,
        date: "2 months ago",
      },
    ],
    insurance: ["Aetna", "BlueCross", "Cash"],
    isOnline: false,
  },
  {
    id: "dr-kim",
    name: "Dr. Min-Jae Kim",
    role: "Specialist",
    credentials: "MD • Neurology",
    specialty: "Neurology",
    subSpecialties: ["Migraines", "Sleep Issues"],
    experience: "13 Years Exp.",
    rating: 4.8,
    reviewCount: 101,
    price: 140,
    nextAvailable: "Thu, 3:45 PM",
    image:
      "https://images.unsplash.com/photo-1524503033411-c9566986fc8f?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Finally got my migraines under control with a simple approach.",
    reviews: [
      {
        author: "Alex P.",
        comment:
          "Finally got my migraines under control with a simple approach.",
        rating: 5,
        date: "2 weeks ago",
      },
      {
        author: "Jules C.",
        comment: "Listened and didn’t rush.",
        rating: 5,
        date: "1 month ago",
      },
    ],
    insurance: ["United", "Cigna"],
    isOnline: true,
  },
  {
    id: "nr-johnson",
    name: "Nurse Priya Johnson",
    role: "Nurse",
    credentials: "RN, BSN • Acute Care",
    specialty: "Nursing Care",
    subSpecialties: ["Wound Care", "Post-op Follow-up"],
    experience: "7 Years Exp.",
    rating: 4.9,
    reviewCount: 57,
    price: 35,
    nextAvailable: "Today, 7:00 PM",
    image:
      "https://images.unsplash.com/photo-1584516150909-c43483ee7932?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Explained wound care step-by-step and checked in the next day.",
    reviews: [
      {
        author: "Bola A.",
        comment:
          "Explained wound care step-by-step and checked in the next day.",
        rating: 5,
        date: "6 days ago",
      },
      {
        author: "Kim L.",
        comment: "Super supportive and patient.",
        rating: 5,
        date: "3 weeks ago",
      },
    ],
    insurance: ["Universal", "Cash"],
    isOnline: true,
  },
  {
    id: "dr-nguyen",
    name: "Dr. Thao Nguyen",
    role: "Specialist",
    credentials: "MD • OB/GYN",
    specialty: "Women's Health",
    subSpecialties: ["Prenatal", "Hormonal Health"],
    experience: "12 Years Exp.",
    rating: 4.9,
    reviewCount: 190,
    price: 105,
    nextAvailable: "Tomorrow, 2:00 PM",
    image:
      "https://images.unsplash.com/photo-1606813902774-9d6b0fd8a6da?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Made me feel comfortable and answered every question clearly.",
    reviews: [
      {
        author: "Tasha V.",
        comment:
          "Made me feel comfortable and answered every question clearly.",
        rating: 5,
        date: "1 week ago",
      },
      {
        author: "Renee S.",
        comment: "Great prenatal guidance.",
        rating: 5,
        date: "2 months ago",
      },
    ],
    insurance: ["BlueCross", "Aetna", "PPO"],
    isOnline: false,
  },
  {
    id: "dr-brown",
    name: "Dr. Caleb Brown",
    role: "Specialist",
    credentials: "MD • Pulmonology",
    specialty: "Pulmonology",
    subSpecialties: ["Asthma", "COPD"],
    experience: "19 Years Exp.",
    rating: 4.7,
    reviewCount: 83,
    price: 125,
    nextAvailable: "Wed, 10:30 AM",
    image:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Helped me understand triggers and adjust inhaler timing correctly.",
    reviews: [
      {
        author: "Sam H.",
        comment:
          "Helped me understand triggers and adjust inhaler timing correctly.",
        rating: 5,
        date: "3 weeks ago",
      },
      {
        author: "Evan G.",
        comment: "Calm, methodical, and helpful.",
        rating: 4,
        date: "2 months ago",
      },
    ],
    insurance: ["Cigna", "United"],
    isOnline: false,
  },
  {
    id: "dr-silva",
    name: "Dr. Mariana Silva",
    role: "Specialist",
    credentials: "MD • Gastroenterology",
    specialty: "Gastroenterology",
    subSpecialties: ["GERD", "IBS"],
    experience: "10 Years Exp.",
    rating: 4.8,
    reviewCount: 112,
    price: 115,
    nextAvailable: "Today, 8:20 PM",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1b?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Finally got relief from GERD with a plan that fits my lifestyle.",
    reviews: [
      {
        author: "Nina F.",
        comment:
          "Finally got relief from GERD with a plan that fits my lifestyle.",
        rating: 5,
        date: "2 weeks ago",
      },
      {
        author: "Omar K.",
        comment: "Very knowledgeable and kind.",
        rating: 5,
        date: "1 month ago",
      },
    ],
    insurance: ["BlueCross", "PPO", "Cash"],
    isOnline: true,
  },
  {
    id: "dr-iyer",
    name: "Dr. Rohan Iyer",
    role: "Specialist",
    credentials: "MD • Psychiatry",
    specialty: "Mental Health",
    subSpecialties: ["ADHD", "Sleep", "Anxiety"],
    experience: "9 Years Exp.",
    rating: 4.8,
    reviewCount: 71,
    price: 90,
    nextAvailable: "Tue, 4:00 PM",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Practical, respectful, and focused on real routines I can keep.",
    reviews: [
      {
        author: "Anon",
        comment:
          "Practical, respectful, and focused on real routines I can keep.",
        rating: 5,
        date: "2 weeks ago",
      },
      {
        author: "Katy R.",
        comment: "Great follow-ups and clear goals.",
        rating: 5,
        date: "2 months ago",
      },
    ],
    insurance: ["Aetna", "Cigna"],
    isOnline: true,
  },
  {
    id: "dr-owens",
    name: "Dr. Harper Owens",
    role: "Specialist",
    credentials: "MD • ENT",
    specialty: "ENT",
    subSpecialties: ["Sinus", "Allergies"],
    experience: "11 Years Exp.",
    rating: 4.7,
    reviewCount: 64,
    price: 85,
    nextAvailable: "Tomorrow, 5:00 PM",
    image:
      "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Fixed my chronic sinus issue with a simple plan and follow-up.",
    reviews: [
      {
        author: "Rita A.",
        comment:
          "Fixed my chronic sinus issue with a simple plan and follow-up.",
        rating: 5,
        date: "1 week ago",
      },
      {
        author: "Dev S.",
        comment: "Efficient and knowledgeable.",
        rating: 4,
        date: "1 month ago",
      },
    ],
    insurance: ["United", "BlueCross"],
    isOnline: false,
  },
  {
    id: "dr-martinez",
    name: "Dr. Sofia Martinez",
    role: "Specialist",
    credentials: "MD • Rheumatology",
    specialty: "Rheumatology",
    subSpecialties: ["Arthritis", "Autoimmune Care"],
    experience: "17 Years Exp.",
    rating: 4.8,
    reviewCount: 92,
    price: 135,
    nextAvailable: "Fri, 1:30 PM",
    image:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Helped me understand flare triggers and adjust my treatment plan.",
    reviews: [
      {
        author: "Janet W.",
        comment:
          "Helped me understand flare triggers and adjust my treatment plan.",
        rating: 5,
        date: "3 weeks ago",
      },
      {
        author: "Mo K.",
        comment: "Very caring and thorough.",
        rating: 5,
        date: "2 months ago",
      },
    ],
    insurance: ["Cigna", "PPO"],
    isOnline: false,
  },
  {
    id: "pa-reed",
    name: "Jordan Reed",
    role: "PA",
    credentials: "PA-C • Urgent Care",
    specialty: "Urgent Care",
    subSpecialties: ["Cold/Flu", "Minor Injuries"],
    experience: "6 Years Exp.",
    rating: 4.6,
    reviewCount: 49,
    price: 40,
    nextAvailable: "Today, 1:45 PM",
    image:
      "https://images.unsplash.com/photo-1520975958225-756a3f6722f3?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Quick diagnosis and clear instructions. Felt better in two days.",
    reviews: [
      {
        author: "Seyi O.",
        comment:
          "Quick diagnosis and clear instructions. Felt better in two days.",
        rating: 5,
        date: "5 days ago",
      },
      {
        author: "Anna P.",
        comment: "Fast and helpful.",
        rating: 4,
        date: "3 weeks ago",
      },
    ],
    insurance: ["BlueCross", "Cash", "Universal"],
    isOnline: true,
  },
  {
    id: "dr-lee",
    name: "Dr. Vivian Lee",
    role: "Specialist",
    credentials: "MD • Ophthalmology",
    specialty: "Eye Care",
    subSpecialties: ["Dry Eye", "Vision Screening"],
    experience: "8 Years Exp.",
    rating: 4.7,
    reviewCount: 58,
    price: 75,
    nextAvailable: "Mon, 9:15 AM",
    image:
      "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Explained eye strain fixes for my screen-heavy job. Super useful.",
    reviews: [
      {
        author: "Tomi A.",
        comment:
          "Explained eye strain fixes for my screen-heavy job. Super useful.",
        rating: 5,
        date: "2 weeks ago",
      },
      {
        author: "Brian S.",
        comment: "Practical and friendly.",
        rating: 4,
        date: "1 month ago",
      },
    ],
    insurance: ["Aetna", "United"],
    isOnline: false,
  },
  {
    id: "dr-mensah",
    name: "Dr. Kofi Mensah",
    role: "Doctor",
    credentials: "MBChB • Internal Medicine",
    specialty: "Internal Medicine",
    subSpecialties: ["Hypertension", "Cholesterol"],
    experience: "13 Years Exp.",
    rating: 4.8,
    reviewCount: 97,
    price: 60,
    nextAvailable: "Today, 9:00 PM",
    image:
      "https://images.unsplash.com/photo-1603415526960-f8f0a9b6b3a9?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Solid guidance on managing my cholesterol without overwhelm.",
    reviews: [
      {
        author: "Henry N.",
        comment:
          "Solid guidance on managing my cholesterol without overwhelm.",
        rating: 5,
        date: "1 week ago",
      },
      {
        author: "Bisi L.",
        comment: "Clear and actionable plan.",
        rating: 5,
        date: "1 month ago",
      },
    ],
    insurance: ["Medicare", "BlueCross", "Cash"],
    isOnline: true,
  },
  {
    id: "dr-fernandez",
    name: "Dr. Lucia Fernandez",
    role: "Therapist",
    credentials: "LCSW • Therapy",
    specialty: "Mental Health",
    subSpecialties: ["Trauma", "Burnout"],
    experience: "12 Years Exp.",
    rating: 4.9,
    reviewCount: 144,
    price: 85,
    nextAvailable: "Thu, 6:00 PM",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Helped me set boundaries and recover from burnout. Highly recommend.",
    reviews: [
      {
        author: "Anon",
        comment:
          "Helped me set boundaries and recover from burnout. Highly recommend.",
        rating: 5,
        date: "3 weeks ago",
      },
      {
        author: "Dami E.",
        comment: "Warm, structured sessions.",
        rating: 5,
        date: "2 months ago",
      },
    ],
    insurance: ["Cigna", "Aetna"],
    isOnline: true,
  },
  {
    id: "dr-jain",
    name: "Dr. Neha Jain",
    role: "Specialist",
    credentials: "MD • Nutrition Medicine",
    specialty: "Nutrition",
    subSpecialties: ["Weight Mgmt", "Metabolic Health"],
    experience: "9 Years Exp.",
    rating: 4.8,
    reviewCount: 69,
    price: 65,
    nextAvailable: "Tomorrow, 8:30 AM",
    image:
      "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Simple meal strategy that fits my schedule and actually sticks.",
    reviews: [
      {
        author: "Grace I.",
        comment:
          "Simple meal strategy that fits my schedule and actually sticks.",
        rating: 5,
        date: "2 weeks ago",
      },
      {
        author: "Ola B.",
        comment: "Very practical advice.",
        rating: 5,
        date: "1 month ago",
      },
    ],
    insurance: ["Universal", "Cash"],
    isOnline: false,
  },
  {
    id: "dr-stone",
    name: "Dr. Ethan Stone",
    role: "Specialist",
    credentials: "MD • Urology",
    specialty: "Urology",
    subSpecialties: ["Men's Health", "Kidney Health"],
    experience: "14 Years Exp.",
    rating: 4.7,
    reviewCount: 61,
    price: 115,
    nextAvailable: "Tue, 12:15 PM",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Professional and direct. Addressed my concerns without judgment.",
    reviews: [
      {
        author: "Anon",
        comment:
          "Professional and direct. Addressed my concerns without judgment.",
        rating: 5,
        date: "1 month ago",
      },
      {
        author: "Victor U.",
        comment: "Excellent bedside manner.",
        rating: 5,
        date: "2 months ago",
      },
    ],
    insurance: ["United", "PPO", "Cash"],
    isOnline: false,
  },
  {
    id: "dr-akinyemi",
    name: "Dr. Sade Akinyemi",
    role: "Specialist",
    credentials: "MD • Dermatology",
    specialty: "Dermatology",
    subSpecialties: ["Hyperpigmentation", "Eczema"],
    experience: "7 Years Exp.",
    rating: 4.8,
    reviewCount: 133,
    price: 90,
    nextAvailable: "Today, 12:30 PM",
    image:
      "https://images.unsplash.com/photo-1551601651-04c2f1b45fd0?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Finally a routine that works for my skin tone. Clear results.",
    reviews: [
      {
        author: "Zainab A.",
        comment:
          "Finally a routine that works for my skin tone. Clear results.",
        rating: 5,
        date: "1 week ago",
      },
      {
        author: "M. P.",
        comment: "Great follow-up and product guidance.",
        rating: 5,
        date: "3 weeks ago",
      },
    ],
    insurance: ["BlueCross", "Aetna", "Cash"],
    isOnline: true,
  },
  {
    id: "dr-hughes",
    name: "Dr. Riley Hughes",
    role: "Specialist",
    credentials: "MD • Oncology",
    specialty: "Oncology",
    subSpecialties: ["Second Opinion", "Care Planning"],
    experience: "20 Years Exp.",
    rating: 4.9,
    reviewCount: 74,
    price: 160,
    nextAvailable: "Fri, 4:00 PM",
    image:
      "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Gave me clarity and calm during a very scary diagnosis.",
    reviews: [
      {
        author: "Anon",
        comment: "Gave me clarity and calm during a very scary diagnosis.",
        rating: 5,
        date: "2 months ago",
      },
      {
        author: "Lydia S.",
        comment: "Very compassionate and clear.",
        rating: 5,
        date: "3 months ago",
      },
    ],
    insurance: ["PPO", "Cash"],
    isOnline: false,
  },
  {
    id: "dr-oliver",
    name: "Dr. Mason Oliver",
    role: "Doctor",
    credentials: "MD • Sleep Medicine",
    specialty: "Sleep Medicine",
    subSpecialties: ["Insomnia", "Sleep Apnea"],
    experience: "10 Years Exp.",
    rating: 4.7,
    reviewCount: 52,
    price: 95,
    nextAvailable: "Tomorrow, 7:15 PM",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200",
    reviewSnippet:
      "Finally sleeping again. Clear plan, no fluff.",
    reviews: [
      {
        author: "Noah B.",
        comment: "Finally sleeping again. Clear plan, no fluff.",
        rating: 5,
        date: "3 weeks ago",
      },
      {
        author: "Ivy T.",
        comment: "Helpful routine tweaks.",
        rating: 4,
        date: "2 months ago",
      },
    ],
    insurance: ["Aetna", "United"],
    isOnline: true,
  },
];
