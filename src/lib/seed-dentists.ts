/**
 * Script to seed dentists from NYC Dentist List CSV into the database
 * Run with: npm run seed:dentists
 */

import { prisma } from "./prisma";
import { Gender } from "@prisma/client";
import { generateAvatar } from "./utils";
import { generateRandomBookings } from "./availability";
import * as fs from "fs";
import * as path from "path";

interface DentistCSVRow {
  Name: string;
  Address: string;
  Category: string;
  Notes: string;
  "Likely Area": string;
  Email: string;
  Phone: string;
}

function parseCSV(content: string): DentistCSVRow[] {
  const lines = content.split("\n").filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(",");
  const dentists: DentistCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV with potential commas in fields
    const values = line.split(",");
    if (values.length < 7) continue;

    // Clean up the values by removing quotes and extra whitespace
    const cleanValue = (val: string) => val?.trim().replace(/^["']|["']$/g, '') || "";

    dentists.push({
      Name: cleanValue(values[0]),
      Address: cleanValue(values[1]),
      Category: cleanValue(values[2]),
      Notes: cleanValue(values[3]),
      "Likely Area": cleanValue(values[4]),
      Email: cleanValue(values[5]),
      Phone: cleanValue(values[6]),
    });
  }

  return dentists;
}

function getSpecialty(category: string, name: string): string {
  const lowerCategory = category.toLowerCase();
  const lowerName = name.toLowerCase();

  if (lowerCategory.includes("pediatric") || lowerName.includes("pediatric")) {
    return "Pediatric Dentistry";
  }
  if (lowerCategory.includes("orthodontic") || lowerName.includes("orthodontic")) {
    return "Orthodontics";
  }
  if (lowerCategory.includes("oral surgeon")) {
    return "Oral Surgery";
  }
  if (lowerCategory.includes("cosmetic") || lowerName.includes("cosmetic")) {
    return "Cosmetic Dentistry";
  }
  if (lowerCategory.includes("implant") || lowerName.includes("implant")) {
    return "Dental Implants";
  }
  if (lowerCategory.includes("endodontist")) {
    return "Endodontics";
  }
  if (lowerCategory.includes("periodontist")) {
    return "Periodontics";
  }

  return "General Dentistry";
}

function generateBio(specialty: string, area: string, name: string): string {
  const practiceName = name.includes("Dr.") || name.includes("DDS") || name.includes("DMD")
    ? name.split(/,|Dr\.|DDS|DMD/)[0].trim()
    : name;

  const bios = [
    `${practiceName} specializes in ${specialty.toLowerCase()}, serving the ${area} community with exceptional care and modern techniques.`,
    `Dedicated to providing comprehensive ${specialty.toLowerCase()} services in ${area}. Patient comfort and satisfaction are our top priorities.`,
    `Experienced dental professionals at ${practiceName} offering ${specialty.toLowerCase()} in the heart of ${area}.`,
    `${practiceName} brings years of expertise in ${specialty.toLowerCase()} to ${area}, combining advanced technology with compassionate care.`,
    `Your trusted ${specialty.toLowerCase()} practice in ${area}, committed to helping you achieve and maintain optimal oral health.`,
  ];

  return bios[Math.floor(Math.random() * bios.length)];
}

function cleanArea(notes: string, likelyArea: string): string {
  // Clean and remove quotes
  const cleanStr = (str: string) => str.replace(/^["']|["']$/g, '').trim();
  
  // Try likely area first
  if (likelyArea && likelyArea !== "") {
    const cleaned = cleanStr(likelyArea);
    // Filter out non-location words
    if (!['dentist', 'dental', 'office', 'practice'].some(word => cleaned.toLowerCase() === word)) {
      return cleaned;
    }
  }
  
  // Try notes
  if (notes && notes !== "") {
    const cleaned = cleanStr(notes);
    if (!['dentist', 'dental', 'office', 'practice'].some(word => cleaned.toLowerCase() === word)) {
      return cleaned;
    }
  }
  
  return "New York";
}

function cleanPhoneNumber(phone: string): string {
  // If phone is already formatted, use it
  if (phone && phone.includes("(")) {
    return phone.trim();
  }
  // Otherwise, generate a random one
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `(${areaCode}) ${prefix}-${lineNumber}`;
}

async function seedDentists() {
  try {
    console.log("🦷 Starting NYC Dentist seeding process...\n");

    // Read CSV file - updated path to match new file
    const csvPath = path.join(process.cwd(), "..", "NYC Dentist List.csv");
    
    if (!fs.existsSync(csvPath)) {
      console.error("❌ CSV file not found at:", csvPath);
      console.log("\nPlease ensure the 'NYC Dentist List.csv' file is at:");
      console.log("  /Users/mominkhan/Dentwise/NYC Dentist List.csv");
      return;
    }

    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const dentistData = parseCSV(csvContent);

    console.log(`📊 Found ${dentistData.length} dentists in CSV\n`);

    let created = 0;
    let skipped = 0;
    const areaStats: Record<string, number> = {};

    for (const dentist of dentistData) {
      if (!dentist.Name || dentist.Name === "" || dentist.Name === "Name") {
        skipped++;
        continue;
      }

      // Use the actual email from CSV
      const email = dentist.Email && dentist.Email.includes("@") 
        ? dentist.Email 
        : `${dentist.Name.toLowerCase().replace(/[^a-z0-9]/g, "")}@dentwise.app`;

      // Use actual phone from CSV
      const phone = cleanPhoneNumber(dentist.Phone);

      // Random gender for avatar generation
      const gender = Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE;

      // Get specialty
      const specialty = getSpecialty(dentist.Category, dentist.Name);

      // Get area
      const area = cleanArea(dentist.Notes, dentist["Likely Area"]);
      areaStats[area] = (areaStats[area] || 0) + 1;

      try {
        // Check if dentist already exists
        const existing = await prisma.doctor.findUnique({
          where: { email },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Create dentist with full data
        const newDoctor = await prisma.doctor.create({
          data: {
            name: dentist.Name,
            email,
            phone,
            speciality: specialty,
            bio: generateBio(specialty, area, dentist.Name),
            address: dentist.Address || "",
            area,
            imageUrl: generateAvatar(dentist.Name, gender),
            gender,
            isActive: true,
          },
        });

        // Generate realistic bookings (3-8 per doctor)
        const bookingsCount = Math.floor(Math.random() * 6) + 3;
        await generateRandomBookings(newDoctor.id, bookingsCount);

        created++;
        if (created % 25 === 0) {
          console.log(`✅ Created ${created} dentists...`);
        }
      } catch (error: any) {
        if (error?.code === "P2002") {
          skipped++;
        } else {
          console.error(`❌ Error creating ${dentist.Name}:`, error.message);
        }
      }
    }

    console.log("\n🎉 Seeding complete!\n");
    console.log(`✅ Successfully created: ${created} dentists`);
    console.log(`⏭️  Skipped (duplicates): ${skipped} dentists`);
    
    console.log("\n📍 Distribution by area:");
    const sortedAreas = Object.entries(areaStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    for (const [area, count] of sortedAreas) {
      console.log(`   ${area}: ${count} dentists`);
    }
    
  } catch (error) {
    console.error("\n❌ Error seeding dentists:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDentists();
