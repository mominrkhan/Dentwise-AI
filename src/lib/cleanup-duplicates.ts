import { prisma } from "./prisma";

async function cleanupDuplicateDoctors() {
  try {
    console.log("🔍 Checking for duplicate doctors...\n");

    // Get all doctors
    const allDoctors = await prisma.doctor.findMany({
      orderBy: { createdAt: "asc" },
    });

    console.log(`📊 Found ${allDoctors.length} total doctors in database\n`);

    // Group doctors by name and email to find duplicates
    const doctorGroups = new Map<string, typeof allDoctors>();
    
    for (const doctor of allDoctors) {
      const key = `${doctor.name.toLowerCase().trim()}-${doctor.email.toLowerCase().trim()}`;
      
      if (!doctorGroups.has(key)) {
        doctorGroups.set(key, []);
      }
      doctorGroups.get(key)!.push(doctor);
    }

    // Find groups with duplicates
    const duplicateGroups = Array.from(doctorGroups.entries()).filter(
      ([_, doctors]) => doctors.length > 1
    );

    if (duplicateGroups.length === 0) {
      console.log("✅ No duplicate doctors found!");
      return;
    }

    console.log(`🚨 Found ${duplicateGroups.length} groups of duplicate doctors:\n`);

    let totalToDelete = 0;

    for (const [key, doctors] of duplicateGroups) {
      console.log(`📋 Group: ${doctors[0].name} (${doctors.length} duplicates)`);
      
      // Keep the first (oldest) doctor, delete the rest
      const toKeep = doctors[0];
      const toDelete = doctors.slice(1);
      
      console.log(`   ✅ Keeping: ${toKeep.id} (created: ${toKeep.createdAt})`);
      
      for (const doctor of toDelete) {
        console.log(`   ❌ Deleting: ${doctor.id} (created: ${doctor.createdAt})`);
        totalToDelete++;
      }
      console.log();
    }

    if (totalToDelete === 0) {
      console.log("✅ No duplicates to clean up!");
      return;
    }

    // Ask for confirmation
    console.log(`⚠️  This will delete ${totalToDelete} duplicate doctors.`);
    console.log("The oldest doctor in each group will be kept.\n");

    // Actually perform the deletion
    console.log("🗑️  Starting cleanup...\n");

    for (const [key, doctors] of duplicateGroups) {
      const toDelete = doctors.slice(1);
      
      for (const doctor of toDelete) {
        try {
          // Delete associated appointments first
          await prisma.appointment.deleteMany({
            where: { doctorId: doctor.id },
          });

          // Delete the doctor
          await prisma.doctor.delete({
            where: { id: doctor.id },
          });

          console.log(`   ✅ Deleted doctor: ${doctor.name} (${doctor.id})`);
        } catch (error) {
          console.error(`   ❌ Error deleting ${doctor.name}:`, error);
        }
      }
    }

    console.log(`\n🎉 Cleanup complete! Deleted ${totalToDelete} duplicate doctors.`);

    // Show final count
    const finalCount = await prisma.doctor.count();
    console.log(`📊 Final doctor count: ${finalCount}`);

  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDuplicateDoctors();
