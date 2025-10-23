import { prisma } from "./prisma";

async function debugDoctors() {
  try {
    console.log("🔍 Debugging doctor data...\n");

    // Get all doctors with their details
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { name: "asc" },
    });

    console.log(`📊 Found ${doctors.length} active doctors\n`);

    // Check for potential duplicates by name
    const nameGroups = new Map<string, typeof doctors>();
    
    for (const doctor of doctors) {
      const name = doctor.name.toLowerCase().trim();
      if (!nameGroups.has(name)) {
        nameGroups.set(name, []);
      }
      nameGroups.get(name)!.push(doctor);
    }

    // Find doctors with same name
    const sameNameGroups = Array.from(nameGroups.entries()).filter(
      ([_, doctors]) => doctors.length > 1
    );

    if (sameNameGroups.length > 0) {
      console.log("🚨 Found doctors with same name:\n");
      
      for (const [name, doctors] of sameNameGroups) {
        console.log(`📋 Name: "${name}" (${doctors.length} doctors)`);
        for (const doctor of doctors) {
          console.log(`   - ID: ${doctor.id}`);
          console.log(`   - Email: ${doctor.email}`);
          console.log(`   - Phone: ${doctor.phone}`);
          console.log(`   - Area: ${doctor.area}`);
          console.log(`   - Created: ${doctor.createdAt}`);
          console.log();
        }
      }
    } else {
      console.log("✅ No doctors with duplicate names found");
    }

    // Show first 10 doctors as sample
    console.log("📋 Sample of first 10 doctors:");
    doctors.slice(0, 10).forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name} (${doctor.email}) - ${doctor.area || 'No area'}`);
    });

  } catch (error) {
    console.error("❌ Error debugging doctors:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugDoctors();
