/**
 * Utility functions for managing doctor availability and appointment slots
 */

import { prisma } from "./prisma";
import { addDays, format, isWeekend, setHours, setMinutes } from "date-fns";

/**
 * Generate available time slots for a specific doctor on a specific date
 * Working hours: 9:00 AM - 5:00 PM, 30-minute slots
 */
export function generateDailyTimeSlots(date: Date): string[] {
  const slots: string[] = [];
  
  // Skip weekends
  if (isWeekend(date)) {
    return slots;
  }

  // Generate slots from 9:00 AM to 5:00 PM
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      slots.push(timeString);
    }
  }

  return slots;
}

/**
 * Get available time slots for a doctor on a specific date (excluding booked slots)
 */
export async function getAvailableTimeSlots(
  doctorId: string,
  date: Date
): Promise<string[]> {
  try {
    // Generate all possible slots for the day
    const allSlots = generateDailyTimeSlots(date);

    // Get booked appointments for this doctor on this date
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: date,
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
      select: { time: true },
    });

    const bookedTimes = bookedAppointments.map((apt) => apt.time);

    // Filter out booked slots
    return allSlots.filter((slot) => !bookedTimes.includes(slot));
  } catch (error) {
    console.error("Error getting available time slots:", error);
    return [];
  }
}

/**
 * Get the next available appointment slot for a doctor
 * Searches through the next 7 days to find the earliest available slot
 */
export async function getNextAvailableSlot(doctorId: string): Promise<{
  date: Date;
  time: string;
  formattedDate: string;
  formattedTime: string;
} | null> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Search through next 7 days
    for (let i = 0; i < 7; i++) {
      const checkDate = addDays(today, i);
      
      // Skip weekends
      if (isWeekend(checkDate)) {
        continue;
      }

      const availableSlots = await getAvailableTimeSlots(doctorId, checkDate);

      if (availableSlots.length > 0) {
        // Return the first available slot
        const time = availableSlots[0];
        const [hours, minutes] = time.split(":").map(Number);
        
        // Format for display
        const isPM = hours >= 12;
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        const period = isPM ? "PM" : "AM";
        const formattedTime = `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;

        return {
          date: checkDate,
          time,
          formattedDate: format(checkDate, "EEE, MMM d"),
          formattedTime,
        };
      }
    }

    return null; // No available slots in the next 7 days
  } catch (error) {
    console.error("Error finding next available slot:", error);
    return null;
  }
}

/**
 * Randomly book some appointments for a doctor to make it feel realistic
 * This generates fake bookings to simulate a real practice
 */
export async function generateRandomBookings(doctorId: string, count: number = 5) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = [];

    // Create a dummy system user for fake appointments if needed
    let systemUser = await prisma.user.findFirst({
      where: { email: "system@dentwise.com" },
    });

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          clerkId: "system",
          email: "system@dentwise.com",
          firstName: "System",
          lastName: "Generated",
        },
      });
    }

    // Generate random bookings over the next 7 days
    for (let i = 0; i < count; i++) {
      const randomDay = Math.floor(Math.random() * 7);
      const date = addDays(today, randomDay);

      if (isWeekend(date)) continue;

      const allSlots = generateDailyTimeSlots(date);
      if (allSlots.length === 0) continue;

      const randomSlot = allSlots[Math.floor(Math.random() * allSlots.length)];

      // Check if this slot is already booked
      const existing = await prisma.appointment.findFirst({
        where: {
          doctorId,
          date,
          time: randomSlot,
        },
      });

      if (!existing) {
        bookings.push({
          userId: systemUser.id,
          doctorId,
          date,
          time: randomSlot,
          reason: "Patient consultation",
          status: "CONFIRMED" as const,
        });
      }
    }

    // Bulk create appointments
    if (bookings.length > 0) {
      await prisma.appointment.createMany({
        data: bookings,
        skipDuplicates: true,
      });
    }

    return bookings.length;
  } catch (error) {
    console.error("Error generating random bookings:", error);
    return 0;
  }
}

