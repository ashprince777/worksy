import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Worksy Seed Data generation...");

  // Clear existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.supportMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.warrantyClaim.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatConversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.rewardTransaction.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.address.deleteMany();
  await prisma.professionalAvailability.deleteMany();
  await prisma.professionalService.deleteMany();
  await prisma.professionalDocument.deleteMany();
  await prisma.serviceArea.deleteMany();
  await prisma.serviceVariant.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.city.deleteMany();
  await prisma.professionalProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settings.deleteMany();

  console.log("🧹 Cleared old data.");

  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  // 1. Platform Settings
  await prisma.settings.createMany({
    data: [
      { key: "PLATFORM_COMMISSION_PERCENT", value: "15.0", category: "COMMISSION", description: "Default platform commission percentage" },
      { key: "PLATFORM_BASE_FEE", value: "49.0", category: "COMMISSION", description: "Platform facilitation fee charged per booking" },
      { key: "GST_PERCENT", value: "18.0", category: "TAX", description: "Standard GST tax percentage on services" },
      { key: "REFERRAL_BONUS_POINTS", value: "100", category: "REWARD", description: "Reward points credited to referee and referrer" },
      { key: "POINTS_TO_CURRENCY_RATIO", value: "1.0", category: "REWARD", description: "Value of 1 reward point in INR" },
      { key: "AUTO_MATCH_RADIUS_KM", value: "15.0", category: "MATCHING", description: "Default matching radius for dispatching jobs" },
    ],
  });

  // 2. Cities & Zones
  const bangalore = await prisma.city.create({
    data: {
      name: "Bangalore",
      state: "Karnataka",
      country: "India",
      code: "BLR",
      zones: {
        create: [
          { name: "Koramangala", pincode: "560034", coordinates: "12.9352,77.6245" },
          { name: "Indiranagar", pincode: "560038", coordinates: "12.9784,77.6408" },
          { name: "HSR Layout", pincode: "560102", coordinates: "12.9121,77.6446" },
          { name: "Whitefield", pincode: "560066", coordinates: "12.9698,77.7499" },
          { name: "Jayanagar", pincode: "560041", coordinates: "12.9308,77.5838" },
        ],
      },
    },
    include: { zones: true },
  });

  const mumbai = await prisma.city.create({
    data: {
      name: "Mumbai",
      state: "Maharashtra",
      country: "India",
      code: "BOM",
      zones: {
        create: [
          { name: "Bandra West", pincode: "400050", coordinates: "19.0596,72.8295" },
          { name: "Andheri East", pincode: "400069", coordinates: "19.1136,72.8697" },
          { name: "Powai", pincode: "400076", coordinates: "19.1176,72.9060" },
          { name: "Juhu", pincode: "400049", coordinates: "19.1026,72.8267" },
        ],
      },
    },
    include: { zones: true },
  });

  const delhi = await prisma.city.create({
    data: {
      name: "Delhi NCR",
      state: "Delhi",
      country: "India",
      code: "DEL",
      zones: {
        create: [
          { name: "Connaught Place", pincode: "110001", coordinates: "28.6315,77.2167" },
          { name: "South Extension", pincode: "110049", coordinates: "28.5724,77.2219" },
          { name: "Hauz Khas", pincode: "110016", coordinates: "28.5494,77.2001" },
          { name: "Dwarka", pincode: "110075", coordinates: "28.5921,77.0460" },
        ],
      },
    },
    include: { zones: true },
  });

  console.log("🏙️ Created 3 cities with 13 zones.");

  // 3. Service Categories (10 Categories)
  const categoryDefinitions = [
    { name: "Home Maintenance", slug: "home-maintenance", iconName: "Wrench", description: "Electrical, plumbing, carpentry, painting and repair experts." },
    { name: "Appliance Services", slug: "appliance-services", iconName: "Tv", description: "AC, refrigerator, washing machine, and microwave repairs." },
    { name: "Cleaning", slug: "cleaning", iconName: "Sparkles", description: "Deep cleaning, kitchen, bathroom, sofa and carpet sanitization." },
    { name: "Beauty", slug: "beauty", iconName: "Scissors", description: "Salon, hair styling, grooming and wellness at your doorstep." },
    { name: "Health", slug: "health", iconName: "HeartPulse", description: "Doctors, physiotherapy, nursing and blood sample collection." },
    { name: "Technology", slug: "technology", iconName: "Laptop", description: "PC, laptop, smartphone repairs and home Wi-Fi setup." },
    { name: "Automotive", slug: "automotive", iconName: "Car", description: "Car service, bike repair, battery jumpstart and detailing." },
    { name: "Delivery", slug: "delivery", iconName: "PackageCheck", description: "Fast local courier, parcel delivery and document pickup." },
    { name: "Events", slug: "events", iconName: "Camera", description: "Photography, catering, balloon decor and sound assistance." },
    { name: "Home Improvement", slug: "home-improvement", iconName: "Home", description: "Modular kitchen, tile work, renovation and interior upgrades." },
  ];

  const categories = [];
  for (let i = 0; i < categoryDefinitions.length; i++) {
    const cat = await prisma.category.create({
      data: {
        name: categoryDefinitions[i].name,
        slug: categoryDefinitions[i].slug,
        iconName: categoryDefinitions[i].iconName,
        description: categoryDefinitions[i].description,
        sortOrder: i + 1,
      },
    });
    categories.push(cat);
  }

  console.log(`📁 Created ${categories.length} categories.`);

  // 4. 50+ Services with Details & Variants
  const serviceDefs = [
    // Home Maintenance (6)
    {
      catSlug: "home-maintenance",
      name: "Electrician Consultation & Repair",
      slug: "electrician-consultation-repair",
      startingPrice: 299,
      pricingType: "HOURLY",
      duration: 60,
      warranty: 30,
      isPopular: true,
      short: "Switchboard repair, wiring check, fixture replacement and safety check.",
      included: ["Inspection of faulty circuit/appliance", "Up to 1 hour technician labor", "Free procurement of standard wiring parts"],
      excluded: ["Spare part material costs", "Concealed wall drilling over 5 meters"],
    },
    {
      catSlug: "home-maintenance",
      name: "Plumbing Leakage & Pipe Fix",
      slug: "plumbing-leakage-pipe-fix",
      startingPrice: 349,
      pricingType: "HOURLY",
      duration: 60,
      warranty: 30,
      isPopular: true,
      short: "Faucet, tap, drain block, pipe leakage and flush tank repairs.",
      included: ["Leakage source diagnosis", "Tap/faucet overhaul", "Sealant application"],
      excluded: ["New sanitaryware purchase", "Main municipal line excavation"],
    },
    {
      catSlug: "home-maintenance",
      name: "Carpenter Door & Furniture Repair",
      slug: "carpenter-door-furniture-repair",
      startingPrice: 399,
      pricingType: "HOURLY",
      duration: 90,
      warranty: 30,
      isPopular: false,
      short: "Hinges, locks, drawer sliders, cabinet realignment and minor woodwork.",
      included: ["Lock fitting/alignment", "Hinge lubrication and replacement", "Drawer guide fixing"],
      excluded: ["Raw plywood cost", "Heavy polishing"],
    },
    {
      catSlug: "home-maintenance",
      name: "Interior House Painting Consultation",
      slug: "interior-house-painting",
      startingPrice: 1499,
      pricingType: "QUOTE_BASED",
      duration: 120,
      warranty: 180,
      isPopular: false,
      short: "Onsite laser measurement, shade selection and computerized estimation.",
      included: ["Detailed wall moisture check", "Laser sqft measurement", "Free shade card preview"],
      excluded: ["Scaffolding for exterior facades", "Major structural plastering"],
    },
    {
      catSlug: "home-maintenance",
      name: "General Handyman 2-Hour Pack",
      slug: "general-handyman-2-hour-pack",
      startingPrice: 599,
      pricingType: "FIXED",
      duration: 120,
      warranty: 15,
      isPopular: true,
      short: "Wall drilling, photo frame hanging, curtain rod and mirror installations.",
      included: ["Up to 8 drill holes", "Curtain rod installation", "Mirror & frame hanging"],
      excluded: ["Heavy masonry breaking", "Specialized glass cutting"],
    },
    {
      catSlug: "home-maintenance",
      name: "Overhead Water Tank Cleaning",
      slug: "overhead-water-tank-cleaning",
      startingPrice: 799,
      pricingType: "QUANTITY_BASED",
      duration: 90,
      warranty: 60,
      isPopular: false,
      short: "High-pressure mechanical de-sludging, scrubbing and UV sanitization.",
      included: ["Sludge de-watering", "High pressure wash", "Antibacterial chemical treatment"],
      excluded: ["Tank structural masonry cracks", "Plumbing inlet valve replacements"],
    },

    // Appliance Services (6)
    {
      catSlug: "appliance-services",
      name: "AC Deep Jet Cleaning & Service",
      slug: "ac-deep-jet-cleaning-service",
      startingPrice: 599,
      pricingType: "FIXED",
      duration: 60,
      warranty: 60,
      isPopular: true,
      short: "Indoor foam jet wash, outdoor unit flush, gas pressure check and filter cleanup.",
      included: ["2x deeper cooling guaranteed", "Indoor jet spray with spill jacket", "Outdoor coil cleaning"],
      excluded: ["Refrigerant gas top-up (charged separately)", "Compressor replacement"],
    },
    {
      catSlug: "appliance-services",
      name: "AC Repair & Cooling Diagnostics",
      slug: "ac-repair-cooling-diagnostics",
      startingPrice: 299,
      pricingType: "HYBRID",
      duration: 60,
      warranty: 30,
      isPopular: true,
      short: "Gas leak detection, PCB board inspection, capacitor & sensor check.",
      included: ["Comprehensive electrical & refrigerant check", "Detailed quotation before part change", "Labor for basic capacitor fix"],
      excluded: ["Spare part cost", "Full coil rewinding"],
    },
    {
      catSlug: "appliance-services",
      name: "Refrigerator Repair & Cooling Fix",
      slug: "refrigerator-repair-cooling-fix",
      startingPrice: 349,
      pricingType: "HYBRID",
      duration: 60,
      warranty: 30,
      isPopular: false,
      short: "Single/Double door fridge cooling issue, thermostat, defrost timer and noise repair.",
      included: ["Thermostat testing", "Relay and overload protector check", "Drain tray cleaning"],
      excluded: ["Compressor replacement unit", "Evaporator coil procurement"],
    },
    {
      catSlug: "appliance-services",
      name: "Washing Machine Repair & Drum Check",
      slug: "washing-machine-repair-drum-check",
      startingPrice: 399,
      pricingType: "HYBRID",
      duration: 60,
      warranty: 30,
      isPopular: true,
      short: "Front load / top load vibration, water inlet valve, motor belt and drain issues.",
      included: ["Inlet & outlet hose inspection", "Belt tension adjustment", "Drain filter cleanup"],
      excluded: ["Motor replacement", "PCB board circuitry rewiring"],
    },
    {
      catSlug: "appliance-services",
      name: "Smart TV Wall Mount Installation",
      slug: "smart-tv-wall-mount-installation",
      startingPrice: 449,
      pricingType: "FIXED",
      duration: 45,
      warranty: 30,
      isPopular: false,
      short: "Precision spirit-level wall mounting for LED/OLED TVs up to 65 inches.",
      included: ["Standard bracket mounting", "Audio/HDMI cable concealment through conduit", "Wi-Fi setup & demo"],
      excluded: ["Wall bracket hardware (can be purchased from pro)", "Concealed wall chasing"],
    },
    {
      catSlug: "appliance-services",
      name: "Microwave Oven Repair",
      slug: "microwave-oven-repair",
      startingPrice: 299,
      pricingType: "HYBRID",
      duration: 45,
      warranty: 30,
      isPopular: false,
      short: "Magnetron heating failure, turntable stuck, sparking and touchpad repair.",
      included: ["Magnetron safety check", "High voltage diode testing", "Turntable motor check"],
      excluded: ["Magnetron replacement unit", "Door glass replacement"],
    },

    // Cleaning (6)
    {
      catSlug: "cleaning",
      name: "Complete Home Deep Cleaning",
      slug: "complete-home-deep-cleaning",
      startingPrice: 2999,
      pricingType: "QUANTITY_BASED",
      duration: 240,
      warranty: 7,
      isPopular: true,
      short: "Living room, bedrooms, bathrooms, kitchen, balconies and window track cleaning.",
      included: ["Single disc machine floor scrubbing", "Appliance exterior degreasing", "Cobweb removal & dry dusting"],
      excluded: ["Interior cabinet packing/unpacking", "Terrace pressure washing"],
    },
    {
      catSlug: "cleaning",
      name: "Intense Bathroom Cleaning",
      slug: "intense-bathroom-cleaning",
      startingPrice: 499,
      pricingType: "QUANTITY_BASED",
      duration: 60,
      warranty: 7,
      isPopular: true,
      short: "Hard water scale removal, tile de-grubbing, toilet sanitization and mirror shine.",
      included: ["Tile grout acid-free cleaning", "Tap & shower chrome buffing", "Drain cover scrubbing"],
      excluded: ["Grout re-filling", "Exhaust fan replacement"],
    },
    {
      catSlug: "cleaning",
      name: "Modular Kitchen Deep Degreasing",
      slug: "modular-kitchen-deep-degreasing",
      startingPrice: 1199,
      pricingType: "FIXED",
      duration: 120,
      warranty: 7,
      isPopular: true,
      short: "Chimney exterior, gas stove, oil stain removal, countertops and sink sparkle.",
      included: ["Heavy oil sludge breakdown", "Tile backsplash steam wiping", "Exhaust hood degreasing"],
      excluded: ["Chimney filter chemical bath (add-on)", "Pest control baiting"],
    },
    {
      catSlug: "cleaning",
      name: "Fabric Sofa Shampooing & Vacuuming",
      slug: "fabric-sofa-shampooing-vacuuming",
      startingPrice: 799,
      pricingType: "QUANTITY_BASED",
      duration: 75,
      warranty: 7,
      isPopular: false,
      short: "Foam shampoo injection and high-powered moisture extraction for 3-seater sofas.",
      included: ["Deep dust extraction", "Specialized stain spotter spray", "Drying assistance tips"],
      excluded: ["Leather conditioning (separate service)", "Permanent ink stain guarantee"],
    },
    {
      catSlug: "cleaning",
      name: "Carpet Deep Extraction Cleaning",
      slug: "carpet-deep-extraction-cleaning",
      startingPrice: 599,
      pricingType: "QUANTITY_BASED",
      duration: 60,
      warranty: 7,
      isPopular: false,
      short: "Industrial carpet extraction machine removes embedded allergens and odors.",
      included: ["Pre-spray deodorizer", "Rotary brush agitating", "Water suction extraction"],
      excluded: ["Handwoven silk antique restoration", "Flooded carpet thermal drying"],
    },
    {
      catSlug: "cleaning",
      name: "Balcony Jet Cleaning",
      slug: "balcony-jet-cleaning",
      startingPrice: 399,
      pricingType: "FIXED",
      duration: 45,
      warranty: 7,
      isPopular: false,
      short: "High-pressure washer cleans bird droppings, moss, railings and floor tiles.",
      included: ["Railing wipe down", "Pressure wash tile floors", "Drain outlet unclogging"],
      excluded: ["Exterior glass facade over 10 feet"],
    },

    // Beauty (5)
    {
      catSlug: "beauty",
      name: "Men Haircut, Beard & Head Massage",
      slug: "men-haircut-beard-head-massage",
      startingPrice: 399,
      pricingType: "FIXED",
      duration: 45,
      warranty: 0,
      isPopular: true,
      short: "Styling haircut, clean beard trim/shave, relaxing cooling oil head massage.",
      included: ["Single-use hygienic sheet", "Sterilized clippers & scissors", "Aftershave balm application"],
      excluded: ["Hair color products"],
    },
    {
      catSlug: "beauty",
      name: "Women Salon at Home Classic Package",
      slug: "women-salon-at-home-classic-package",
      startingPrice: 999,
      pricingType: "FIXED",
      duration: 90,
      warranty: 0,
      isPopular: true,
      short: "Rica wax arms & legs, threading, cleanup, and de-tan face pack.",
      included: ["Disposable bed cover", "Cartridge roll-on wax", "Post-wax soothing lotion"],
      excluded: ["Full body polish"],
    },
    {
      catSlug: "beauty",
      name: "Bridal HD Makeup & Saree Draping",
      slug: "bridal-hd-makeup-saree-draping",
      startingPrice: 4999,
      pricingType: "FIXED",
      duration: 150,
      warranty: 0,
      isPopular: false,
      short: "High-definition camera ready bridal makeup, luxury lashes, and elegant hair styling.",
      included: ["Premium international cosmetics (MAC/Huda)", "Lashes & hair extensions styling", "Saree / lehenga pinning"],
      excluded: ["Jewelry rental"],
    },
    {
      catSlug: "beauty",
      name: "Deluxe Pedicure & Manicure Spa",
      slug: "deluxe-pedicure-manicure-spa",
      startingPrice: 799,
      pricingType: "FIXED",
      duration: 60,
      warranty: 0,
      isPopular: true,
      short: "Warm bubble soak, cuticle care, walnut scrub, massage cream and nail polish.",
      included: ["Disposable foot tub liner", "Exfoliating foot file", "Premium breathable nail polish"],
      excluded: ["Gel nail extension removal"],
    },
    {
      catSlug: "beauty",
      name: "Herbal Facial & Golden Glow Therapy",
      slug: "herbal-facial-golden-glow-therapy",
      startingPrice: 1299,
      pricingType: "FIXED",
      duration: 75,
      warranty: 0,
      isPopular: false,
      short: "Deep pore steam extraction, gold leaf massage cream, tightening algae pack.",
      included: ["Skin diagnostic check", "Ozone facial steaming", "Back & shoulder pressure point massage"],
      excluded: ["Chemical peel treatment"],
    },

    // Health (4)
    {
      catSlug: "health",
      name: "General Physician Home Visit",
      slug: "general-physician-home-visit",
      startingPrice: 799,
      pricingType: "FIXED",
      duration: 45,
      warranty: 0,
      isPopular: true,
      short: "Certified MBBS doctor physical examination, vitals check and digital prescription.",
      included: ["Blood pressure, SpO2 & ECG reading", "Symptom diagnosis & clinical assessment", "Digital prescription on Worksy app"],
      excluded: ["Emergency ICU ambulance dispatch", "Hospital admission charges"],
    },
    {
      catSlug: "health",
      name: "Orthopedic Physiotherapy Session",
      slug: "orthopedic-physiotherapy-session",
      startingPrice: 699,
      pricingType: "FIXED",
      duration: 60,
      warranty: 0,
      isPopular: true,
      short: "TENS therapy, muscle mobilization, post-surgical rehabilitation and posture correction.",
      included: ["Functional movement screen", "Ultrasound / TENS electrotherapy", "Custom home exercise protocol"],
      excluded: ["Specialized traction bed hire"],
    },
    {
      catSlug: "health",
      name: "Full Body Diagnostic Sample Collection",
      slug: "full-body-diagnostic-sample-collection",
      startingPrice: 999,
      pricingType: "FIXED",
      duration: 30,
      warranty: 0,
      isPopular: true,
      short: "Doorstep phlebotomist collection for 68 vital blood parameters and lipid profile.",
      included: ["Vacuum barcode tubes", "Ice-box cold chain sample transport", "NABL accredited lab report in 12 hours"],
      excluded: ["Contrast radiology scans"],
    },
    {
      catSlug: "health",
      name: "Elderly Nursing Care 8-Hour Shift",
      slug: "elderly-nursing-care-8-hour-shift",
      startingPrice: 1499,
      pricingType: "HOURLY",
      duration: 480,
      warranty: 0,
      isPopular: false,
      short: "Dedicated GNM nurse for medication management, feeding, mobility and vitals logging.",
      included: ["Medication dispensation chart", "Bed sore preventive positioning", "Companionship & assistance"],
      excluded: ["Doctor injection without valid Rx", "Domestic maid cleaning work"],
    },

    // Technology (5)
    {
      catSlug: "technology",
      name: "Laptop Hardware & OS Repair",
      slug: "laptop-hardware-os-repair",
      startingPrice: 499,
      pricingType: "HYBRID",
      duration: 60,
      warranty: 30,
      isPopular: true,
      short: "Thermal paste renewal, slow boot, SSD upgrade, Windows/macOS reinstalls.",
      included: ["Thermal exhaust fan cleaning", "SMART hard drive health scan", "Malware & bloatware scan"],
      excluded: ["Replacement SSD / RAM module cost", "BGA chip reballing"],
    },
    {
      catSlug: "technology",
      name: "Whole-Home Wi-Fi Mesh Setup",
      slug: "whole-home-wifi-mesh-setup",
      startingPrice: 699,
      pricingType: "FIXED",
      duration: 75,
      warranty: 45,
      isPopular: false,
      short: "Zero dead-zone mesh configuration, router channel optimization and security tuning.",
      included: ["RF signal strength heat mapping", "Dual band SSID optimization", "Guest network isolation"],
      excluded: ["Hardware router/mesh nodes cost", "CAT6 conduit cabling over 20m"],
    },
    {
      catSlug: "technology",
      name: "Desktop Custom PC Build & Diagnostic",
      slug: "desktop-custom-pc-build-diagnostic",
      startingPrice: 899,
      pricingType: "FIXED",
      duration: 90,
      warranty: 30,
      isPopular: false,
      short: "Gaming rig assembly, cable routing, BIOS flashing and stress testing.",
      included: ["Liquid cooler mounting", "Cable management ties", "AIDA64 stress test validation"],
      excluded: ["Components and GPU supply", "Custom water loop bending"],
    },
    {
      catSlug: "technology",
      name: "Smartphone Screen & Battery Replacement",
      slug: "smartphone-screen-battery-replacement",
      startingPrice: 399,
      pricingType: "HYBRID",
      duration: 45,
      warranty: 90,
      isPopular: true,
      short: "On-the-spot screen replacement with anti-static workstation tools.",
      included: ["Pre & post touch digitizer testing", "Adhesive waterproofing gasket", "Free tempered glass install"],
      excluded: ["OEM screen display spare part cost"],
    },
    {
      catSlug: "technology",
      name: "CCTV Security Camera Installation",
      slug: "cctv-security-camera-installation",
      startingPrice: 1299,
      pricingType: "QUOTE_BASED",
      duration: 120,
      warranty: 60,
      isPopular: false,
      short: "Smart IP camera mounting, DVR setup, mobile live-view remote access.",
      included: ["Camera positioning calibration", "DVR port forwarding setup", "Smartphone Worksy sync"],
      excluded: ["Hard disk storage", "BNC/RG59 coaxial cable bulk rolls"],
    },

    // Automotive (4)
    {
      catSlug: "automotive",
      name: "Doorstep Periodic Car Service",
      slug: "doorstep-periodic-car-service",
      startingPrice: 1999,
      pricingType: "FIXED",
      duration: 120,
      warranty: 60,
      isPopular: true,
      short: "Engine oil change, air/oil filter replacement, 40-point health inspection.",
      included: ["Complete brake pad cleaning", "Coolant top-up check", "OBD2 computerized error code scan"],
      excluded: ["Synthetic engine oil cost (charged at MRP)", "Major suspension overhaul"],
    },
    {
      catSlug: "automotive",
      name: "Two-Wheeler Full Tuneup & Oil Change",
      slug: "two-wheeler-full-tuneup-oil-change",
      startingPrice: 699,
      pricingType: "FIXED",
      duration: 60,
      warranty: 30,
      isPopular: true,
      short: "Spark plug cleaning, carburetor/injector tune, chain lube and brake adjustment.",
      included: ["Clutch cable slack adjustment", "Drum/disc brake degreasing", "Full body foam wash"],
      excluded: ["New brake shoes", "Tire tube replacement"],
    },
    {
      catSlug: "automotive",
      name: "Emergency Car Battery Jumpstart",
      slug: "emergency-car-battery-jumpstart",
      startingPrice: 399,
      pricingType: "FIXED",
      duration: 30,
      warranty: 7,
      isPopular: true,
      short: "30-minute rapid arrival heavy-duty booster jumpstart and alternator charging test.",
      included: ["12V jump starter connection", "Alternator ripple test", "Terminal corrosion cleaning"],
      excluded: ["Brand new battery purchase"],
    },
    {
      catSlug: "automotive",
      name: "Complete Car Interior Deep Spa",
      slug: "complete-car-interior-deep-spa",
      startingPrice: 1499,
      pricingType: "FIXED",
      duration: 120,
      warranty: 15,
      isPopular: false,
      short: "Seat dry cleaning, dashboard conditioning, roof liner stain removal and AC sanitization.",
      included: ["High power suction vacuuming", "AC duct antibacterial steaming", "Dashboard UV protective wax"],
      excluded: ["Exterior ceramic coating"],
    },

    // Delivery (4)
    {
      catSlug: "delivery",
      name: "Urgent Express Document Delivery",
      slug: "urgent-express-document-delivery",
      startingPrice: 149,
      pricingType: "FIXED",
      duration: 45,
      warranty: 0,
      isPopular: true,
      short: "Direct point-to-point courier for passports, contracts and critical documents.",
      included: ["Tamper-evident waterproof pouch", "Realtime GPS tracking", "OTP verification upon delivery"],
      excluded: ["Illegal materials", "Items weighing above 5kg"],
    },
    {
      catSlug: "delivery",
      name: "Local Parcel & Package Delivery",
      slug: "local-parcel-package-delivery",
      startingPrice: 199,
      pricingType: "FIXED",
      duration: 60,
      warranty: 0,
      isPopular: true,
      short: "Doorstep pickup and delivery up to 15 kg within city limits.",
      included: ["Pickup within 30 minutes", "Insured up to ₹5,000", "Live SMS alerts"],
      excluded: ["Hazardous chemicals or inflammable cargo"],
    },
    {
      catSlug: "delivery",
      name: "Fragile Cake & Flower Delivery",
      slug: "fragile-cake-flower-delivery",
      startingPrice: 249,
      pricingType: "FIXED",
      duration: 45,
      warranty: 0,
      isPopular: false,
      short: "Temperature insulated insulated bag and gentle zero-shake handling.",
      included: ["Insulated thermal box transport", "Hand-to-hand careful handover", "Greeting card delivery"],
      excluded: ["Heavy metal objects"],
    },
    {
      catSlug: "delivery",
      name: "Bulk Return Pickup for Businesses",
      slug: "bulk-return-pickup-businesses",
      startingPrice: 499,
      pricingType: "QUANTITY_BASED",
      duration: 90,
      warranty: 0,
      isPopular: false,
      short: "Multi-point pickup of merchandise and return consolidation.",
      included: ["Barcode scanning at point of pickup", "Summary digital manifest", "Consolidated delivery to hub"],
      excluded: ["Storage warehouse fees"],
    },

    // Events (5)
    {
      catSlug: "events",
      name: "Candid Birthday & Event Photography",
      slug: "candid-birthday-event-photography",
      startingPrice: 2999,
      pricingType: "HOURLY",
      duration: 180,
      warranty: 30,
      isPopular: true,
      short: "Professional Sony Alpha/Canon full-frame photographer with portable speedlights.",
      included: ["100+ edited high-resolution digital photos", "Same-week Google Drive link delivery", "Highlight reel of top 25 images"],
      excluded: ["Physical leather-bound printed album (available as add-on)"],
    },
    {
      catSlug: "events",
      name: "Intimate House Party Catering (15 Pax)",
      slug: "intimate-house-party-catering",
      startingPrice: 5999,
      pricingType: "QUANTITY_BASED",
      duration: 180,
      warranty: 0,
      isPopular: false,
      short: "Chef prepared 3-course menu, hot chafing dish setup and biodegradable plates.",
      included: ["2 Starters, 2 Mains, 1 Rice, Breads, 1 Dessert", "Chafing dishes with burners", "Serving cutlery & napkins"],
      excluded: ["Alcohol bar setup"],
    },
    {
      catSlug: "events",
      name: "Birthday Theme Balloon & Backdrop Decor",
      slug: "birthday-theme-balloon-backdrop-decor",
      startingPrice: 2499,
      pricingType: "FIXED",
      duration: 90,
      warranty: 0,
      isPopular: true,
      short: "Organic balloon arch, metallic ring backdrop, neon LED sign and fairy lights.",
      included: ["150 metallic balloons arch", "Happy Birthday neon light rental", "Complete cleanup after event"],
      excluded: ["Custom 3D printed thematic character cutouts"],
    },
    {
      catSlug: "events",
      name: "Portable Sound System & Mic Setup",
      slug: "portable-sound-system-mic-setup",
      startingPrice: 1499,
      pricingType: "FIXED",
      duration: 240,
      warranty: 0,
      isPopular: false,
      short: "JBL/Bose party tower with two wireless microphones and Bluetooth audio mixer.",
      included: ["2x cordless UHF microphones", "Aux & Bluetooth connectivity", "Technician audio check"],
      excluded: ["Live DJ performance"],
    },
    {
      catSlug: "events",
      name: "Live Cocktail / Mocktail Bartender",
      slug: "live-cocktail-mocktail-bartender",
      startingPrice: 2499,
      pricingType: "HOURLY",
      duration: 240,
      warranty: 0,
      isPopular: false,
      short: "Certified mixologist crafts signature welcome drinks and curated infusions.",
      included: ["Bar tool kit (shakers, strainers, jiggers)", "Garnish prep assistance", "Custom printed menu board"],
      excluded: ["Supply of liquor and beverage syrups"],
    },

    // Home Improvement (5)
    {
      catSlug: "home-improvement",
      name: "Modular Kitchen Cabinet Renovation",
      slug: "modular-kitchen-cabinet-renovation",
      startingPrice: 4999,
      pricingType: "QUOTE_BASED",
      duration: 180,
      warranty: 365,
      isPopular: true,
      short: "Marine plywood, acrylic shutters, soft-close Blum hinges and drawer baskets.",
      included: ["3D visualization layout render", "Site laser measurement", "1-year installation warranty"],
      excluded: ["Granite counter-top slab cutting"],
    },
    {
      catSlug: "home-improvement",
      name: "Decorative Accent Wall & Texture Painting",
      slug: "decorative-accent-wall-texture-painting",
      startingPrice: 2499,
      pricingType: "FIXED",
      duration: 180,
      warranty: 180,
      isPopular: true,
      short: "Metallic stucco, concrete finish, geometric stencil or marble effect feature wall.",
      included: ["Up to 120 sq ft accent wall", "Base primer & 2 coats texture paint", "Floor masking protection"],
      excluded: ["Moisture dampness waterproofing remediation"],
    },
    {
      catSlug: "home-improvement",
      name: "Bathroom Tile Re-grouting & Waterproofing",
      slug: "bathroom-tile-regrouting-waterproofing",
      startingPrice: 1999,
      pricingType: "FIXED",
      duration: 120,
      warranty: 180,
      isPopular: false,
      short: "Epoxy waterproof grouting seals joints to prevent seepage into lower floors.",
      included: ["Old damaged grout raking", "Dual-component epoxy grout filling", "Acid-free surface wash"],
      excluded: ["Total floor tile replacement"],
    },
    {
      catSlug: "home-improvement",
      name: "Soundproof UPVC Window Installation",
      slug: "soundproof-upvc-window-installation",
      startingPrice: 3499,
      pricingType: "QUOTE_BASED",
      duration: 180,
      warranty: 365,
      isPopular: false,
      short: "Multi-chambered German UPVC profiles with double-glazed acoustic glass.",
      included: ["Onsite frame measurement", "Acoustic silicone perimeter sealing", "Smooth multi-point hardware lock"],
      excluded: ["Civil masonry dismantling of existing heavy stone frames"],
    },
    {
      catSlug: "home-improvement",
      name: "Designer False Ceiling Consultation",
      slug: "designer-false-ceiling-consultation",
      startingPrice: 999,
      pricingType: "QUOTE_BASED",
      duration: 90,
      warranty: 365,
      isPopular: false,
      short: "Gypsum board cove lighting, peripheral tray design and LED strip placement.",
      included: ["Structural ceiling load assessment", "Electrical light placement blueprint", "Cost estimate per square foot"],
      excluded: ["Procurement of raw gypsum channels"],
    },
  ];

  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));
  const createdServices = [];

  for (const s of serviceDefs) {
    const categoryId = categoryMap.get(s.catSlug);
    if (!categoryId) continue;

    const serv = await prisma.service.create({
      data: {
        categoryId,
        name: s.name,
        slug: s.slug,
        startingPrice: s.startingPrice,
        pricingType: s.pricingType,
        durationMinutes: s.duration,
        warrantyDays: s.warranty,
        isPopular: s.isPopular,
        shortDescription: s.short,
        description: `${s.name} delivered by verified Worksy pros with transparent rates and a ${s.warranty}-day service warranty.`,
        includedItems: JSON.stringify(s.included),
        excludedItems: JSON.stringify(s.excluded),
        variants: {
          create: [
            { name: "Standard Pack", price: s.startingPrice, durationMinutes: s.duration, isDefault: true, description: "Essential standard service coverage." },
            { name: "Comprehensive Care", price: Math.round(s.startingPrice * 1.5), durationMinutes: Math.round(s.duration * 1.4), isDefault: false, description: "Extended deep treatment with supplementary inspections." },
          ],
        },
      },
    });
    createdServices.push(serv);
  }

  console.log(`🛠️ Created ${createdServices.length} rich services with variants.`);

  // 5. Create Core Demo Accounts
  // Customer Demo
  const demoCustomer = await prisma.user.create({
    data: {
      name: "Arun Sharma",
      email: "customer@worksy.com",
      phone: "9876543210",
      passwordHash: defaultPasswordHash,
      role: "CUSTOMER",
      customerProfile: {
        create: {
          emergencyContact: "+91 98450 11223",
          notes: "Prefers morning slots on weekends.",
        },
      },
      reward: {
        create: {
          pointsBalance: 350,
          lifetimeEarned: 500,
          lifetimeRedeemed: 150,
          referralCode: "ARUN-WORKSY",
        },
      },
      addresses: {
        create: [
          {
            label: "Home",
            street: "Flat 402, Green Glen Layout, Bellandur",
            landmark: "Near Outer Ring Road",
            city: "Bangalore",
            state: "Karnataka",
            postalCode: "560103",
            isDefault: true,
          },
          {
            label: "Office",
            street: "Prestige Tech Park, Marathahalli-Sarjapur Rd",
            landmark: "Jupiter Building 3rd Floor",
            city: "Bangalore",
            state: "Karnataka",
            postalCode: "560103",
            isDefault: false,
          },
        ],
      },
    },
    include: { addresses: true },
  });

  // Professional Demo (Rajesh Kumar)
  const demoProUser = await prisma.user.create({
    data: {
      name: "Rajesh Kumar",
      email: "pro@worksy.com",
      phone: "9876543211",
      passwordHash: defaultPasswordHash,
      role: "PROFESSIONAL",
    },
  });

  const demoProProfile = await prisma.professionalProfile.create({
    data: {
      userId: demoProUser.id,
      bio: "Certified master electrician and appliance technician with over 8 years of residential and commercial troubleshooting experience. 100% genuine parts guaranteed.",
      experienceYears: 8,
      rating: 4.92,
      reviewCount: 142,
      completionRate: 98.6,
      responseTimeMinutes: 10,
      hourlyRate: 349.0,
      verificationStatus: "APPROVED",
      isOnline: true,
      documents: {
        create: [
          { documentType: "AADHAAR", documentNumber: "XXXX-XXXX-4812", documentUrl: "/docs/kyc_aadhaar_demo.pdf", verificationStatus: "VERIFIED", verifiedAt: new Date() },
          { documentType: "TRADE_LICENSE", documentNumber: "ELEC-KA-2018-9921", documentUrl: "/docs/kyc_electrician_license.pdf", verificationStatus: "VERIFIED", verifiedAt: new Date() },
        ],
      },
      bankAccounts: {
        create: [
          { accountHolderName: "Rajesh Kumar", accountNumber: "912301004812", ifscCode: "HDFC0001234", bankName: "HDFC Bank", isVerified: true, isPrimary: true },
        ],
      },
      availabilities: {
        create: [
          { dayOfWeek: 1, startTime: "08:30", endTime: "19:00", isWorkingDay: true },
          { dayOfWeek: 2, startTime: "08:30", endTime: "19:00", isWorkingDay: true },
          { dayOfWeek: 3, startTime: "08:30", endTime: "19:00", isWorkingDay: true },
          { dayOfWeek: 4, startTime: "08:30", endTime: "19:00", isWorkingDay: true },
          { dayOfWeek: 5, startTime: "08:30", endTime: "19:00", isWorkingDay: true },
          { dayOfWeek: 6, startTime: "09:00", endTime: "18:00", isWorkingDay: true },
          { dayOfWeek: 0, startTime: "10:00", endTime: "14:00", isWorkingDay: false },
        ],
      },
    },
  });

  // Assign demo pro services
  const electricianServices = createdServices.filter(s => s.slug.includes("electrician") || s.slug.includes("ac-") || s.slug.includes("refrigerator"));
  for (const s of electricianServices) {
    await prisma.professionalService.create({
      data: {
        professionalId: demoProProfile.id,
        serviceId: s.id,
        isAvailable: true,
      },
    });
  }

  // Admin Demo Account
  await prisma.user.create({
    data: {
      name: "Worksy Operations Team",
      email: "admin@worksy.com",
      phone: "9876543212",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
    },
  });

  // Super Admin Account
  await prisma.user.create({
    data: {
      name: "Worksy Founder & Security",
      email: "superadmin@worksy.com",
      phone: "9876543213",
      passwordHash: defaultPasswordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log("👤 Demo accounts created for Customer, Professional, Admin and Super Admin.");

  // 6. 20+ Realistic Professionals
  const proNames = [
    { name: "Suresh Patil", bio: "Master plumber with 11 years experience in copper & CPVC piping.", exp: 11, rating: 4.88, cat: "home-maintenance" },
    { name: "Amit Verma", bio: "Carpenter specializing in European modular furniture and locks.", exp: 6, rating: 4.91, cat: "home-maintenance" },
    { name: "Imran Khan", bio: "HVAC and AC cooling expert. Trained by Daikin & Voltas.", exp: 9, rating: 4.95, cat: "appliance-services" },
    { name: "Vikram Sengupta", bio: "Washing machine and microwave electronics specialist.", exp: 7, rating: 4.82, cat: "appliance-services" },
    { name: "Sunita Reddy", bio: "Certified deep cleaning supervisor with a 4-member sanitized crew.", exp: 5, rating: 4.96, cat: "cleaning" },
    { name: "Pooja Hegde", bio: "Luxury beautician trained in VLCC institute. Bridal & skin specialist.", exp: 8, rating: 4.99, cat: "beauty" },
    { name: "Dr. Arvind Menon", bio: "General physician with 14 years clinical experience in home visits.", exp: 14, rating: 4.98, cat: "health" },
    { name: "Ananya Iyer", bio: "Certified MPT physiotherapist specializing in joint & spine rehab.", exp: 7, rating: 4.94, cat: "health" },
    { name: "Karthik Raja", bio: "Hardware systems engineer & home Wi-Fi mesh optimization pro.", exp: 6, rating: 4.89, cat: "technology" },
    { name: "Dinesh Gowda", bio: "Senior automotive technician. Ex-Maruti Suzuki master mechanic.", exp: 12, rating: 4.93, cat: "automotive" },
    { name: "Mohammed Zeeshan", bio: "Superfast reliable parcel and valuable document courier.", exp: 4, rating: 4.86, cat: "delivery" },
    { name: "Rohan Kapoor", bio: "Candid lifestyle and event photographer with Sony A7IV.", exp: 6, rating: 4.97, cat: "events" },
    { name: "Satish Kulkarni", bio: "Modular kitchen and interior woodwork craftsman.", exp: 10, rating: 4.85, cat: "home-improvement" },
    { name: "Kiran Joseph", bio: "Appliance repair pro with focus on smart inverter refrigerators.", exp: 5, rating: 4.87, cat: "appliance-services" },
    { name: "Meera Nair", bio: "Organic salon, organic threading, and de-tan herbal specialist.", exp: 6, rating: 4.92, cat: "beauty" },
    { name: "Gopal Krishna", bio: "Water tank cleaner with industrial high pressure rotary pumps.", exp: 7, rating: 4.79, cat: "cleaning" },
    { name: "Praveen Tiwari", bio: "Emergency car mechanic, battery jumpstart and road assistance.", exp: 8, rating: 4.90, cat: "automotive" },
    { name: "Sameer Joshi", bio: "Audio and stage sound systems engineer for private events.", exp: 9, rating: 4.84, cat: "events" },
    { name: "Deepak Soni", bio: "Mobile phone screen and motherboard technician.", exp: 5, rating: 4.78, cat: "technology" },
    { name: "Manoj Chawla", bio: "Accent wall texture painter and waterproofing expert.", exp: 11, rating: 4.91, cat: "home-improvement" },
  ];

  const createdPros = [demoProProfile];

  for (let i = 0; i < proNames.length; i++) {
    const p = proNames[i];
    const u = await prisma.user.create({
      data: {
        name: p.name,
        email: `pro.${i + 1}@worksy.com`,
        phone: `98112233${(i + 10).toString().slice(-2)}`,
        passwordHash: defaultPasswordHash,
        role: "PROFESSIONAL",
      },
    });

    const prof = await prisma.professionalProfile.create({
      data: {
        userId: u.id,
        bio: p.bio,
        experienceYears: p.exp,
        rating: p.rating,
        reviewCount: Math.floor(Math.random() * 80) + 20,
        completionRate: 97.0 + Math.random() * 2.8,
        responseTimeMinutes: 10 + (i % 15),
        hourlyRate: 299 + (i % 4) * 50,
        verificationStatus: i === 18 ? "PENDING_REVIEW" : "APPROVED",
        isOnline: i % 5 !== 0,
        documents: {
          create: [
            { documentType: "AADHAAR", documentNumber: `XXXX-XXXX-${1000 + i}`, documentUrl: `/docs/kyc_${i}.pdf`, verificationStatus: i === 18 ? "PENDING" : "VERIFIED", verifiedAt: i === 18 ? null : new Date() },
          ],
        },
        bankAccounts: {
          create: [
            { accountHolderName: p.name, accountNumber: `50100234${1000 + i}`, ifscCode: "ICIC0000102", bankName: "ICICI Bank", isVerified: true, isPrimary: true },
          ],
        },
      },
    });

    // Link services in category
    const catServices = createdServices.filter(s => s.categoryId === categoryMap.get(p.cat));
    for (const s of catServices) {
      await prisma.professionalService.create({
        data: {
          professionalId: prof.id,
          serviceId: s.id,
          isAvailable: true,
        },
      });
    }

    createdPros.push(prof);
  }

  console.log(`👨‍🔧 Created ${createdPros.length} professional profiles with services & documents.`);

  // 7. 30+ Realistic Customers
  const customerNames = [
    "Priya Nambiar", "Rahul Deshmukh", "Sneha Roy", "Venkatesh Prasad", "Deepa Pillai",
    "Aditya Mittal", "Kavita Rao", "Siddharth Jain", "Ankita Mukherjee", "Gaurav Bhatt",
    "Shweta Joshi", "Naveen Sundaram", "Divya Menon", "Rishabh Saxena", "Tanvi Agrawal",
    "Manish Agarwal", "Aishwarya Nair", "Harish Natarajan", "Bhavna Patel", "Kunal Singhal",
    "Sonal Kulkarni", "Mohan Das", "Ritu Sethi", "Ashwin Kumar", "Preeti Hegde",
    "Karthik Swamy", "Madhavi Latha", "Abhishek Tiwari", "Pooja Malhotra", "Varun Chopra"
  ];

  const createdCustomers = [demoCustomer];
  const allZones = [...bangalore.zones, ...mumbai.zones, ...delhi.zones];

  for (let i = 0; i < customerNames.length; i++) {
    const cName = customerNames[i];
    const zone = allZones[i % allZones.length];
    const u = await prisma.user.create({
      data: {
        name: cName,
        email: `customer.${i + 1}@example.com`,
        phone: `97000000${(i + 10).toString().slice(-2)}`,
        passwordHash: defaultPasswordHash,
        role: "CUSTOMER",
        customerProfile: {
          create: {
            emergencyContact: "+91 99887 76655",
          },
        },
        reward: {
          create: {
            pointsBalance: (i * 35) % 400,
            lifetimeEarned: (i * 50) + 100,
            lifetimeRedeemed: (i * 15),
            referralCode: `WRK-${cName.slice(0, 3).toUpperCase()}${100 + i}`,
          },
        },
        addresses: {
          create: [
            {
              label: "Home",
              street: `#${12 + i}, 4th Main, ${zone.name}`,
              city: zone.cityId === bangalore.id ? "Bangalore" : zone.cityId === mumbai.id ? "Mumbai" : "Delhi",
              state: zone.cityId === bangalore.id ? "Karnataka" : zone.cityId === mumbai.id ? "Maharashtra" : "Delhi",
              postalCode: zone.pincode,
              isDefault: true,
            },
          ],
        },
      },
      include: { addresses: true },
    });
    createdCustomers.push(u);
  }

  console.log(`👨‍👩‍👧 Created ${createdCustomers.length} registered customers with addresses.`);

  // 8. Coupons
  const coupons = await prisma.coupon.createMany({
    data: [
      { code: "WORKSY50", title: "50% Welcome Discount", description: "Get 50% discount on your first booking up to ₹200", discountType: "PERCENTAGE", discountValue: 50.0, maxDiscountAmount: 200.0, minOrderAmount: 399.0, expiryDate: new Date("2027-12-31") },
      { code: "FIRST100", title: "Flat ₹100 Off", description: "Flat ₹100 instant off on orders above ₹499", discountType: "FIXED", discountValue: 100.0, minOrderAmount: 499.0, expiryDate: new Date("2027-12-31") },
      { code: "FESTIVE20", title: "Festive Sparkle 20% Off", description: "Get 20% discount on all home cleaning services up to ₹500", discountType: "PERCENTAGE", discountValue: 20.0, maxDiscountAmount: 500.0, minOrderAmount: 999.0, expiryDate: new Date("2027-12-31") },
      { code: "ACSERVICE", title: "Cool Summer ₹150 Off", description: "Flat ₹150 off on AC service and diagnostics", discountType: "FIXED", discountValue: 150.0, minOrderAmount: 599.0, expiryDate: new Date("2027-12-31") },
    ],
  });

  console.log("🎟️ Created active promotional coupons.");

  // 9. 50+ Diverse Bookings with Lifecycle Data
  const bookingStatuses = [
    "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED",
    "IN_PROGRESS", "ON_THE_WAY", "CONFIRMED", "PENDING", "CANCELLED", "DISPUTED"
  ];

  let bookingCounter = 1000;
  for (let i = 0; i < 52; i++) {
    bookingCounter++;
    const customer = createdCustomers[i % createdCustomers.length];
    const address = customer.addresses[0];
    const service = createdServices[i % createdServices.length];
    const pro = createdPros[i % createdPros.length];
    const status = bookingStatuses[i % bookingStatuses.length];

    const basePrice = service.startingPrice;
    const discount = i % 3 === 0 ? 50 : 0;
    const tax = Math.round((basePrice - discount) * 0.18);
    const platformFee = 49;
    const finalAmount = basePrice - discount + tax + platformFee;

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() - (25 - (i % 30)));

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: `WRK-2026-${bookingCounter}`,
        customerId: customer.id,
        professionalId: status !== "PENDING" ? pro.id : null,
        addressId: address.id,
        status,
        scheduledDate,
        scheduledTimeSlot: "10:00 AM - 11:30 AM",
        notes: "Please call upon arrival at the gate.",
        totalAmount: basePrice,
        discountAmount: discount,
        taxAmount: tax,
        platformFee,
        finalAmount,
        warrantyExpiresAt: status === "COMPLETED" ? new Date(Date.now() + 30 * 86400000) : null,
        items: {
          create: [
            {
              serviceId: service.id,
              title: service.name,
              quantity: 1,
              unitPrice: basePrice,
              totalPrice: basePrice,
            },
          ],
        },
        statusHistory: {
          create: [
            { status: "PENDING", note: "Booking initiated by customer." },
            ...(status !== "PENDING" ? [{ status: "CONFIRMED", note: "System confirmed booking schedule." }] : []),
            ...(status === "ON_THE_WAY" || status === "IN_PROGRESS" || status === "COMPLETED" ? [{ status: "ON_THE_WAY", note: "Partner is en route to customer location." }] : []),
            ...(status === "IN_PROGRESS" || status === "COMPLETED" ? [{ status: "IN_PROGRESS", note: "Partner started diagnostic and service." }] : []),
            ...(status === "COMPLETED" ? [{ status: "COMPLETED", note: "Customer verified service completion and signed off." }] : []),
            ...(status === "CANCELLED" ? [{ status: "CANCELLED", note: "Customer cancelled due to change in plan." }] : []),
            ...(status === "DISPUTED" ? [{ status: "DISPUTED", note: "Customer reported issue with cooling after technician left." }] : []),
          ],
        },
      },
    });

    // If completed or in progress, create payment and invoice
    if (status === "COMPLETED" || status === "IN_PROGRESS") {
      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          paymentNumber: `PAY-${bookingCounter}`,
          amount: finalAmount,
          currency: "INR",
          status: "SUCCESS",
          paymentMethod: i % 2 === 0 ? "UPI" : "CARD",
          paidAt: new Date(),
          transactions: {
            create: [
              { transactionType: "CHARGE", amount: finalAmount, status: "SUCCESS" },
            ],
          },
        },
      });

      await prisma.invoice.create({
        data: {
          bookingId: booking.id,
          invoiceNumber: `INV-2026-${bookingCounter}`,
          subtotal: basePrice,
          discountAmount: discount,
          taxAmount: tax,
          platformFee,
          totalAmount: finalAmount,
          issuedDate: new Date(),
        },
      });

      // Platform commission
      const commAmount = Math.round(basePrice * 0.15);
      await prisma.commission.create({
        data: {
          bookingId: booking.id,
          professionalId: pro.id,
          ratePercent: 15.0,
          commissionAmount: commAmount,
          professionalPayout: basePrice - commAmount,
          status: "SETTLED",
          settledAt: new Date(),
        },
      });
    }

    // If completed, add realistic verified reviews
    if (status === "COMPLETED" && i % 2 === 0) {
      const reviewComments = [
        "Extremely courteous and arrived right on the dot. Fixed our electrical tripping in 20 minutes!",
        "Very knowledgeable technician. Explained what caused the leakage and cleaned up thoroughly afterwards.",
        "Delighted with the service! The room feels like a 5-star hotel now after the deep cleaning.",
        "Super professional behavior, proper ID card worn, and clean tools used. Worksy is my go-to service now.",
        "Prompt service. Fair pricing without any hidden charges. Highly recommended for everyone in Bangalore!",
      ];

      await prisma.review.create({
        data: {
          bookingId: booking.id,
          customerId: customer.id,
          professionalId: pro.id,
          overallRating: 5.0,
          professionalismRating: 5.0,
          qualityRating: 5.0,
          punctualityRating: 4.8,
          communicationRating: 5.0,
          valueRating: 4.9,
          comment: reviewComments[i % reviewComments.length],
        },
      });
    }
  }

  console.log("📋 Created 52 bookings across statuses with payments, invoices, commission ledgers and reviews.");

  // 10. Customer Support Ticket & Warranty Claim Examples
  await prisma.supportTicket.create({
    data: {
      ticketNumber: "TCK-2026-0812",
      customerId: demoCustomer.id,
      category: "BILLING",
      priority: "MEDIUM",
      status: "OPEN",
      subject: "Invoice download error on mobile browser",
      description: "When clicking download invoice for booking WRK-2026-1002, the PDF button showed a blank tab.",
      messages: {
        create: [
          { senderId: demoCustomer.id, senderRole: "CUSTOMER", message: "Hi Worksy support, I need the GST invoice copy for my corporate expense filing." },
        ],
      },
    },
  });

  console.log("✅ Worksy seed execution successfully completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
