import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateAvatar(name: string, gender: "MALE" | "FEMALE") {
  // Extract initials - max 2 characters for clean look
  const words = name.trim().split(/\s+/);
  let initials = "";
  
  // Remove common words like "Dental", "Dr.", "Care", etc.
  const meaningfulWords = words.filter(word => 
    !['dental', 'dr', 'dr.', 'dentist', 'care', 'center', 'clinic', 'office', '-', '|'].includes(word.toLowerCase())
  );
  
  if (meaningfulWords.length === 0) {
    // Fallback to first word if all filtered out
    initials = words[0].substring(0, 2).toUpperCase();
  } else if (meaningfulWords.length === 1) {
    // Single meaningful word - take first 2 characters
    initials = meaningfulWords[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple words - take first letter of first 2 words only
    initials = meaningfulWords
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }
  
  // Generate beautiful solid backgrounds (not gradients for better readability)
  const colors = [
    "4f46e5", // indigo
    "7c3aed", // violet
    "0891b2", // cyan
    "059669", // emerald
    "dc2626", // red
    "ea580c", // orange
    "2563eb", // blue
    "db2777", // pink
  ];
  
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];
  
  // Create a simple, clean avatar with just 2 initials
  // Font size 0.5 for 2 characters to fit perfectly in circle
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&length=2&size=256&font-size=0.5&bold=true&background=${bgColor}&color=ffffff&format=svg`;
}

// phone formatting function for US numbers - ai generated 🎉
export const formatPhoneNumber = (value: string) => {
  if (!value) return value;

  const phoneNumber = value.replace(/[^\d]/g, "");
  const phoneNumberLength = phoneNumber.length;

  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

//  ai generated 🎉
export const getNext5Days = () => {
  const dates = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let i = 0; i < 5; i++) {
    const date = new Date(tomorrow);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
};

export const getAvailableTimeSlots = () => {
  return [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];
};

export const APPOINTMENT_TYPES = [
  { id: "checkup", name: "Regular Checkup", duration: "60 min", price: "$120" },
  { id: "cleaning", name: "Teeth Cleaning", duration: "45 min", price: "$90" },
  { id: "consultation", name: "Consultation", duration: "30 min", price: "$75" },
  { id: "emergency", name: "Emergency Visit", duration: "30 min", price: "$150" },
];