import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const companies = ["Google", "Amazon", "Microsoft", "Meta", "Uber", "Atlassian"];
const roles = ["Software Engineer", "Product Manager", "Data Scientist", "Solutions Architect", "Engineering Manager"];
const levels = ["L3", "L4", "L5", "L6", "L7"];
const locations = ["Bangalore", "Hyderabad", "Pune", "Remote"];

// Map levels to realistic YOE ranges
function getYOEForLevel(level: string): { min: number; max: number } {
  switch (level) {
    case "L3": return { min: 0, max: 3 };
    case "L4": return { min: 2, max: 6 };
    case "L5": return { min: 5, max: 10 };
    case "L6": return { min: 8, max: 15 };
    case "L7": return { min: 12, max: 20 };
    default: return { min: 0, max: 5 };
  }
}

// Get realistic salary components in INR (Lakhs)
function getSalaryComponents(company: string, role: string, level: string) {
  let baseMin = 10;
  let baseMax = 20;
  let bonusPercent = 0.10; // 10% of base
  let stockMin = 2;
  let stockMax = 8;

  // Set multipliers based on company prestige
  let multiplier = 1.0;
  if (company === "Google" || company === "Meta") multiplier = 1.35;
  if (company === "Uber") multiplier = 1.25;
  if (company === "Amazon" || company === "Atlassian") multiplier = 1.15;
  if (company === "Microsoft") multiplier = 1.05;

  // Set ranges by level
  switch (level) {
    case "L3":
      baseMin = 12;
      baseMax = 22;
      stockMin = 3;
      stockMax = 8;
      bonusPercent = 0.10;
      break;
    case "L4":
      baseMin = 22;
      baseMax = 38;
      stockMin = 8;
      stockMax = 18;
      bonusPercent = 0.12;
      break;
    case "L5":
      baseMin = 36;
      baseMax = 58;
      stockMin = 18;
      stockMax = 38;
      bonusPercent = 0.15;
      break;
    case "L6":
      baseMin = 55;
      baseMax = 95;
      stockMin = 38;
      stockMax = 75;
      bonusPercent = 0.20;
      break;
    case "L7":
      baseMin = 90;
      baseMax = 160;
      stockMin = 75;
      stockMax = 160;
      bonusPercent = 0.25;
      break;
  }

  // Adjust for role
  if (role === "Engineering Manager") {
    // EM levels are usually higher, L5+
    baseMin *= 1.15;
    baseMax *= 1.15;
  } else if (role === "Product Manager") {
    baseMin *= 1.05;
    baseMax *= 1.05;
  } else if (role === "Solutions Architect") {
    baseMin *= 0.9;
    baseMax *= 0.9;
    stockMin *= 0.8;
    stockMax *= 0.8;
  }

  // Apply company multiplier
  baseMin *= multiplier;
  baseMax *= multiplier;
  stockMin *= multiplier;
  stockMax *= multiplier;

  // Generate random base, bonus, stock
  const base = Math.round((baseMin + Math.random() * (baseMax - baseMin)) * 10) / 10;
  const bonus = Math.round((base * bonusPercent * (0.8 + Math.random() * 0.4)) * 10) / 10;
  const stock = Math.round((stockMin + Math.random() * (stockMax - stockMin)) * 10) / 10;

  // Return values in INR (converted from Lakhs to full numeric value)
  // e.g. 15 Lakhs = 1500000
  return {
    base: base * 100000,
    bonus: bonus * 100000,
    stock: stock * 100000,
  };
}

async function main() {
  console.log("Starting seeding...");

  // Clear existing data
  await prisma.savedComparison.deleteMany();
  await prisma.compensationEntry.deleteMany();
  await prisma.company.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // Create standard user
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@paylens.io",
      image: "https://lh3.googleusercontent.com/a/default-user",
    },
  });

  // Create companies
  const companyMap: Record<string, any> = {};
  for (const cName of companies) {
    const slug = cName.toLowerCase();
    companyMap[cName] = await prisma.company.create({
      data: {
        name: cName,
        slug,
        logoUrl: `/logos/${slug}.svg`,
      },
    });
  }

  // Create roles
  const roleMap: Record<string, any> = {};
  for (const rName of roles) {
    roleMap[rName] = await prisma.role.create({
      data: {
        name: rName,
      },
    });
  }

  console.log("Created companies and roles. Seeding compensation entries...");

  // Generate 700 compensation entries
  const entriesData: any[] = [];
  for (let i = 0; i < 700; i++) {
    // Choose random features
    const companyName = companies[Math.floor(Math.random() * companies.length)];
    const roleName = roles[Math.floor(Math.random() * roles.length)];
    let level = levels[Math.floor(Math.random() * levels.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];

    // Engineering Managers should only be L5-L7
    if (roleName === "Engineering Manager" && (level === "L3" || level === "L4")) {
      level = ["L5", "L6", "L7"][Math.floor(Math.random() * 3)];
    }

    const company = companyMap[companyName];
    const role = roleMap[roleName];

    // YOE calculations
    const yoeLimits = getYOEForLevel(level);
    const yoe = Math.floor(yoeLimits.min + Math.random() * (yoeLimits.max - yoeLimits.min + 1));
    const yoeAtCompany = Math.max(0, Math.floor(Math.random() * (yoe + 1)));

    // Salary components
    const { base, bonus, stock } = getSalaryComponents(companyName, roleName, level);
    const totalCompensation = base + bonus + stock;

    entriesData.push({
      userId: demoUser.id,
      companyId: company.id,
      roleId: role.id,
      level,
      location,
      yoe,
      yoeAtCompany,
      base,
      bonus,
      stock,
      totalCompensation,
      currency: "INR",
      submittedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
    });
  }

  // Insert batch
  await prisma.compensationEntry.createMany({
    data: entriesData,
  });

  // Create a default comparison for the demo user
  await prisma.savedComparison.create({
    data: {
      userId: demoUser.id,
      name: "Google L4 vs Meta L4",
      queryParams: JSON.stringify({
        companies: ["Google", "Meta"],
        levels: ["L4"],
        locations: ["Bangalore"],
      }),
    },
  });

  // Seed sample reviews
  console.log("Seeding reviews...");
  const reviewTemplates = [
    { rating: 5, title: "Great work-life balance and perks", pros: "Excellent compensation, great colleagues, meaningful work. The campus facilities are world-class and the food is amazing.", cons: "Can be bureaucratic at times. Decision making is slow for large initiatives.", isCurrent: true },
    { rating: 4, title: "Good place to learn and grow", pros: "Strong engineering culture, lots of smart people to learn from. Good opportunities for internal mobility.", cons: "Promotions can be slow. Performance review process is stressful.", isCurrent: true },
    { rating: 3, title: "Decent but not what it used to be", pros: "Job security is good. Benefits are competitive. Remote work policy is flexible.", cons: "Management has become too process-heavy. Less innovation than before.", isCurrent: false },
    { rating: 2, title: "High pressure, low recognition", pros: "Good salary and stock options. Working on challenging problems.", cons: "Toxic culture in some teams. Unrealistic deadlines. Poor work-life balance.", isCurrent: false },
    { rating: 4, title: "Strong compensation, intense culture", pros: "Top-of-market compensation. Smartest people I've worked with. Fast-paced environment.", cons: "Work-life balance depends heavily on team. On-call rotations can be brutal.", isCurrent: true },
    { rating: 5, title: "Best place I've worked", pros: "Amazing culture, great benefits, truly cares about employees. The learning opportunities are unmatched.", cons: "Hard to stand out. Very high performance bar.", isCurrent: true },
    { rating: 3, title: "Mixed experience overall", pros: "Good pay and benefits. Office locations are great.", cons: "Lack of career growth. Middle management is ineffective.", isCurrent: false },
    { rating: 4, title: "Great for early career engineers", pros: "Mentorship programs are excellent. Lots of growth opportunities. Good work culture.", cons: "Below-market compensation for senior roles. Too many meetings.", isCurrent: true },
  ];

  const designations = ["SDE I", "SDE II", "Senior SDE", "Staff SDE", "Product Manager", "Data Scientist", "Engineering Manager"];
  const reviewLocations = ["Bangalore", "Hyderabad", "Pune", "Gurgaon", "Remote"];

  for (const company of companies) {
    const companyRecord = companyMap[company];
    const numReviews = 2 + Math.floor(Math.random() * 4); // 2-5 reviews per company
    for (let i = 0; i < numReviews; i++) {
      const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
      await prisma.companyReview.create({
        data: {
          companyId: companyRecord.id,
          userId: demoUser.id,
          rating: template.rating,
          title: template.title,
          pros: template.pros,
          cons: template.cons,
          isCurrentEmployee: template.isCurrent,
          designation: designations[Math.floor(Math.random() * designations.length)],
          location: reviewLocations[Math.floor(Math.random() * reviewLocations.length)],
          isAnonymous: Math.random() > 0.5,
          helpfulCount: Math.floor(Math.random() * 15),
          status: Math.random() > 0.2 ? "APPROVED" : "PENDING",
          createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Seed sample benefits
  console.log("Seeding benefits...");
  const benefitTemplates: Array<{ name: string; category: string; description: string }> = [
    { name: "Health Insurance", category: "Health & Wellness", description: "Comprehensive medical, dental, and vision coverage" },
    { name: "Life Insurance", category: "Health & Wellness", description: "Term life insurance coverage" },
    { name: "Mental Health Support", category: "Health & Wellness", description: "Counseling and mental wellness programs" },
    { name: "Gym Membership", category: "Health & Wellness", description: "Free or subsidized gym membership" },
    { name: "Stock Options", category: "Financial", description: "Employee stock option plan (ESOP)" },
    { name: "Annual Bonus", category: "Financial", description: "Performance-based annual bonus" },
    { name: "Retirement Fund", category: "Financial", description: "Employer PF contribution above statutory minimum" },
    { name: "Free Meals", category: "Perks", description: "Free breakfast, lunch, and snacks" },
    { name: "Transport Allowance", category: "Perks", description: "Cab service or transport reimbursement" },
    { name: "Remote Work", category: "Perks", description: "Flexible work-from-home policy" },
    { name: "Learning Budget", category: "Growth", description: "Annual budget for courses, conferences, and certifications" },
    { name: "Sabbatical", category: "Growth", description: "Paid sabbatical after certain years of service" },
  ];

  // Assign specific benefits to each company (some variation)
  const companyBenefits: Record<string, string[]> = {
    "Google": ["Health Insurance", "Life Insurance", "Mental Health Support", "Gym Membership", "Stock Options", "Annual Bonus", "Free Meals", "Transport Allowance", "Remote Work", "Learning Budget", "Sabbatical"],
    "Meta": ["Health Insurance", "Mental Health Support", "Gym Membership", "Stock Options", "Annual Bonus", "Free Meals", "Remote Work", "Learning Budget"],
    "Microsoft": ["Health Insurance", "Life Insurance", "Stock Options", "Annual Bonus", "Retirement Fund", "Transport Allowance", "Remote Work", "Learning Budget", "Sabbatical"],
    "Amazon": ["Health Insurance", "Life Insurance", "Stock Options", "Annual Bonus", "Free Meals", "Transport Allowance", "Learning Budget"],
    "Uber": ["Health Insurance", "Mental Health Support", "Stock Options", "Annual Bonus", "Free Meals", "Remote Work", "Learning Budget"],
    "Atlassian": ["Health Insurance", "Mental Health Support", "Stock Options", "Annual Bonus", "Remote Work", "Learning Budget", "Sabbatical"],
  };

  for (const [companyName, benefitNames] of Object.entries(companyBenefits)) {
    const companyRecord = companyMap[companyName];
    for (const benefitName of benefitNames) {
      const template = benefitTemplates.find(b => b.name === benefitName)!;
      await prisma.companyBenefit.create({
        data: {
          companyId: companyRecord.id,
          name: template.name,
          category: template.category,
          description: template.description,
          avgRating: Math.round((3 + Math.random() * 2) * 10) / 10,
        },
      });
    }
  }

  console.log(`Successfully seeded ${entriesData.length} records, reviews, and benefits!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
