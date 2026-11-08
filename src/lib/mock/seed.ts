import "server-only";
import { CATEGORY_IDS, type Amenity, type CategoryId, type Importance, type Listing, type LivingProfile, type Owner, type Student } from "@/lib/types";

// Everything here is invented sample data. No real people, no real addresses.
// Every sample student is 18 or older.

/** Sample school-email domains and the cluster they map to. */
export const SCHOOL_DOMAINS: Record<string, string> = {
  "ust.edu.ph": "U-Belt, Sampaloc",
  "feu.edu.ph": "U-Belt, Sampaloc",
  "ue.edu.ph": "U-Belt, Sampaloc",
  "pup.edu.ph": "Sta. Mesa",
};

function p(values: number[], importance: Importance[]): LivingProfile {
  return Object.fromEntries(CATEGORY_IDS.map((id, i) => [id, { value: values[i], importance: importance[i] }])) as LivingProfile;
}

const allConsent = { matching: true, photoToMatches: true, checkinsForScoring: false, universityReports: false };

function student(
  id: string,
  firstName: string,
  yearOfBirth: number,
  gender: Student["gender"],
  cluster: string,
  values: number[],
  importance: Importance[],
  dealbreakers: CategoryId[],
  budget: [number, number],
  mustHaves: Amenity[],
  simulation: Record<string, number> = {},
): Student {
  return {
    id,
    firstName,
    schoolEmail: `${id}@sample.edu.ph`,
    verifiedAt: "2026-10-01T00:00:00.000Z",
    verifiedMethod: "school_email",
    yearOfBirth,
    gender,
    roomPreference: "same",
    schoolCluster: cluster,
    profile: p(values, importance),
    dealbreakers,
    houseRules: { smokingInside: "never", drinkingAtHome: "occasionally", overnightGuests: "with_notice" },
    simulation,
    budgetMin: budget[0],
    budgetMax: budget[1],
    mustHaves,
    consent: { ...allConsent },
    photo: id,
    createdAt: "2026-10-01T00:00:00.000Z",
    isSample: true,
  };
}

const UB = "U-Belt, Sampaloc";

export function seedStudents(): Student[] {
  return [
    //                                           sleep clean noise social study food temp priv resp
    student("s1", "Maya", 2005, "woman", UB, [1, 3, 1, 2, 3, 2, 1, 3, 3], [3, 3, 2, 1, 3, 1, 2, 2, 3], ["cleanliness"], [4000, 6000], ["wifi", "aircon"], { "overnight-guest": 3, "unpaid-bill": 3 }),
    student("s2", "Bea", 2006, "woman", UB, [1, 3, 1, 1, 3, 2, 1, 3, 3], [3, 2, 3, 1, 3, 1, 1, 2, 2], ["noise"], [3500, 5500], ["wifi", "study_area"]),
    student("s3", "Carla", 2004, "woman", UB, [3, 1, 3, 4, 1, 3, 2, 1, 1], [2, 1, 1, 3, 1, 2, 1, 1, 1], [], [5000, 8000], ["aircon"], { "weekend-hangout": 3 }),
    student("s4", "Dani", 2007, "woman", UB, [2, 2, 2, 2, 2, 3, 1, 2, 2], [2, 2, 2, 2, 2, 2, 3, 2, 2], ["temperature"], [4000, 6500], ["aircon", "laundry"]),
    student("s5", "Ella", 2003, "woman", UB, [4, 0, 4, 3, 0, 1, 3, 1, 0], [3, 1, 2, 2, 1, 1, 2, 1, 1], ["sleep"], [3000, 4500], []),
    student("s6", "Faye", 2005, "woman", "Sta. Mesa", [1, 3, 1, 2, 3, 2, 1, 3, 3], [3, 3, 2, 1, 3, 1, 2, 2, 3], [], [3500, 5000], ["wifi"]),
    student("s7", "Gab", 2005, "man", UB, [2, 3, 1, 2, 3, 2, 1, 3, 3], [2, 3, 2, 1, 3, 1, 2, 2, 3], [], [4000, 6000], ["wifi"]),
    student("s8", "Hiro", 2004, "man", UB, [3, 2, 2, 3, 2, 3, 1, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2, 2], [], [4500, 7000], ["aircon"]),
  ];
}

export function seedOwners(): Owner[] {
  return [
    { id: "o1", firstName: "Rosa", verifiedAt: "2026-09-15T00:00:00.000Z" },
    { id: "o2", firstName: "Ben", verifiedAt: "2026-09-20T00:00:00.000Z" },
  ];
}

function listing(
  id: string,
  ownerId: string,
  title: string,
  area: string,
  monthlyRent: number,
  openSlots: number,
  genderPolicy: Listing["genderPolicy"],
  amenities: Amenity[],
): Listing {
  return {
    id,
    ownerId,
    title,
    area,
    address: `Unit ${id.toUpperCase()}, 100 Sample Street, ${area} (sample address)`,
    monthlyRent,
    openSlots,
    genderPolicy,
    amenities,
    verified: true,
    isSample: true,
  };
}

export function seedListings(): Listing[] {
  return [
    listing("l1", "o1", "Quiet 2-bed room near España", "Sampaloc, near España Blvd.", 5500, 2, "women", ["wifi", "aircon", "study_area", "near_campus"]),
    listing("l2", "o1", "Budget bedspace, 4 per room", "Sampaloc, near Dapitan", 3200, 3, "women", ["wifi", "laundry", "near_campus"]),
    listing("l3", "o1", "Studio-type for 2 with own CR", "Sampaloc, near P. Noval", 7800, 2, "mixed", ["wifi", "aircon", "own_bathroom"]),
    listing("l4", "o2", "Shared room with study hall", "Sampaloc, near Lacson Ave.", 4800, 1, "women", ["wifi", "study_area", "laundry"]),
    listing("l5", "o2", "Men's dorm, aircon rooms", "Sampaloc, near Laong Laan", 5200, 2, "men", ["wifi", "aircon", "near_campus"]),
    listing("l6", "o2", "Fan room, walk to campus", "Sta. Mesa, near Teresa St.", 3000, 2, "mixed", ["near_campus", "laundry"]),
    listing("l7", "o1", "Newly renovated 2-bed", "Sampaloc, near Lerma", 6500, 2, "women", ["wifi", "aircon", "own_bathroom", "laundry"]),
    listing("l8", "o2", "Bedspace with weekly cleaning", "Sampaloc, near Earnshaw", 4200, 2, "mixed", ["wifi", "laundry"]),
    listing("l9", "o1", "Room for 2, study desks", "Sta. Mesa, near Pureza", 4500, 2, "women", ["wifi", "study_area", "near_campus"]),
    listing("l10", "o2", "Aircon bedspace, men only", "Sampaloc, near Dapitan", 4600, 3, "men", ["aircon", "wifi"]),
  ];
}
