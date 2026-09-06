/**
 * ============================================================================
 * MOCK DATA — Standalone Demo Data for Believer
 * ============================================================================
 *
 * Replace Supabase calls with these synchronous helpers, or use the Async
 * variants (delayed by ~150 ms) to simulate network latency.
 * ============================================================================
 */

import type {
  Customer,
  Dispute,
  Notification,
  Order,
  Package,
  PackageProduct,
  Product,
  Runner,
  RunnerReceipt,
  RunnerPayment,
  Temple,
  TempleRequest,
  Setting,
} from "@/types";

// ── Re-export types for convenience ────────────────────────────────────────
export type {
  Customer,
  Dispute,
  Notification,
  Order,
  Package,
  PackageProduct,
  Product,
  Runner,
  RunnerReceipt,
  RunnerPayment,
  Temple,
  TempleRequest,
  Setting,
};

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

/** Generic helper: populate joined fields on an order. */
function hydrateOrder(raw: Order): Order {
  const customer = raw.customer_id
    ? mockCustomers.find((c) => c.id === raw.customer_id)
    : undefined;
  const temple = mockTemples.find((t) => t.id === raw.temple_id);
  const pkg = raw.package_id
    ? mockPackages.find((p) => p.id === raw.package_id)
    : undefined;
  const runner = raw.runner_id
    ? mockRunners.find((r) => r.id === raw.runner_id)
    : undefined;
  return { ...raw, customer, temple, package: pkg, runner };
}

// ============================================================================
// TEMPLES (4)
// ============================================================================

export const mockTemples: Temple[] = [
  {
    id: "temple-001",
    name: "Erawan Shrine",
    country: "Thailand",
    city: "Bangkok",
    address: "136 Ratchadamri Road, Lumpini, Pathum Wan, Bangkok 10330",
    latitude: 13.7472,
    longitude: 100.5397,
    status: "active",
    verification_status: "verified",
    notes: "Very popular shrine in central Bangkok. Best visited early morning for fewer crowds.",
    photos: [
      "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    ],
    short_description:
      "Erawan Shrine, a famous Hindu shrine in central Bangkok, known as the shrine of Brahma. Located near the Grand Hyatt Erawan hotel and major shopping malls.",
    short_description_zh:
      "伊旺那拉达纳拉隆寺，曼谷市中心著名的印度教神庙，供奉四面佛。位于爱悦酒店旁，周边是大型百货商圈。",
    prayer_tags: ["career", "luck", "wealth"],
    prayer_tags_zh: ["事业", "好运", "财运"],
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2025-11-20T14:30:00Z",
  },
  {
    id: "temple-002",
    name: "Wat Pho",
    country: "Thailand",
    city: "Bangkok",
    address: "2 Sanam Chai Road, Phra Nakhon, Bangkok 10200",
    latitude: 13.7466,
    longitude: 100.4933,
    status: "active",
    verification_status: "verified",
    notes: "Home of the famous Reclining Buddha and birthplace of traditional Thai massage.",
    photos: [
      "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800",
      "https://images.unsplash.com/photo-1562602833-0ac9a8b57d97?w=800",
    ],
    short_description:
      "Wat Pho, one of Bangkok's oldest and largest temples, famous for the 46-metre Reclining Buddha statue and as the birthplace of Thai massage.",
    short_description_zh:
      "卧佛寺，曼谷最古老的寺庙之一，以46米长的卧佛闻名，也是泰式按摩的发源地。",
    prayer_tags: ["health", "education", "blessing"],
    prayer_tags_zh: ["健康", "学业", "祈福"],
    created_at: "2024-02-10T06:00:00Z",
    updated_at: "2025-10-05T09:15:00Z",
  },
  {
    id: "temple-003",
    name: "Wat Arun",
    country: "Thailand",
    city: "Bangkok",
    address: "158 Wang Doem Road, Wat Arun, Bangkok Yai, Bangkok 10600",
    latitude: 13.7437,
    longitude: 100.4888,
    status: "active",
    verification_status: "verified",
    notes: "Iconic riverside temple. Khmer-style prang. Beautiful at sunset. Ferry required from Tha Tien pier.",
    photos: [
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    ],
    short_description:
      "Wat Arun, the iconic riverside temple (Temple of Dawn), known for its stunning Khmer-style prang decorated with porcelain.",
    short_description_zh:
      "黎明寺，湄南河畔的标志性寺庙，以其镶嵌瓷器的壮丽高棉式佛塔闻名，黄昏时分尤为美丽。",
    prayer_tags: ["love", "luck", "vow"],
    prayer_tags_zh: ["感情", "好运", "还愿"],
    created_at: "2024-03-22T10:30:00Z",
    updated_at: "2025-12-01T16:45:00Z",
  },
  {
    id: "temple-004",
    name: "Kek Lok Si",
    country: "Malaysia",
    city: "Penang",
    address: "1000-L, Jalan Balik Pulau, 11500 Ayer Itam, Penang",
    latitude: 5.4024,
    longitude: 100.2723,
    status: "active",
    verification_status: "verified",
    notes: "Largest Buddhist temple in Southeast Asia. Mix of Chinese, Thai and Burmese architecture. Great for Vesak.",
    photos: [
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    ],
    short_description:
      "Kek Lok Si, one of the largest Buddhist temples in Southeast Asia, located on Penang Hill with a blend of Chinese, Thai, and Burmese architectural styles.",
    short_description_zh:
      "极乐寺，东南亚最大的佛教寺庙之一，坐落于槟城山上，融合了中国、泰国和缅甸的建筑风格。",
    prayer_tags: ["career", "health", "safety"],
    prayer_tags_zh: ["事业", "健康", "平安"],
    created_at: "2024-05-05T04:00:00Z",
    updated_at: "2025-09-18T11:20:00Z",
  },
];

// ============================================================================
// PRODUCTS (per temple — used by packages & receipts)
// ============================================================================

export const mockProducts: Product[] = [
  // ── Erawan Shrine products ──────────────────────────────────────────────
  {
    id: "prod-001",
    temple_id: "temple-001",
    name: "Fresh Flower Garland (Small)",
    type: "physical",
    cost_to_runner: 4.5,
    evidence_required: ["photo_before", "photo_after"],
    notes: "Small garland of jasmine and marigold flowers",
    is_active: true,
    created_at: "2024-01-16T08:00:00Z",
    updated_at: "2024-01-16T08:00:00Z",
  },
  {
    id: "prod-002",
    temple_id: "temple-001",
    name: "Incense Bundle (12 sticks)",
    type: "physical",
    cost_to_runner: 2.0,
    evidence_required: ["photo_before", "photo_after"],
    notes: "Bundle of 12 incense sticks",
    is_active: true,
    created_at: "2024-01-16T08:30:00Z",
    updated_at: "2024-01-16T08:30:00Z",
  },
  {
    id: "prod-003",
    temple_id: "temple-001",
    name: "Coconut Offering",
    type: "physical",
    cost_to_runner: 6.0,
    evidence_required: ["photo_after"],
    notes: "Whole coconut with prayer ribbon",
    is_active: true,
    created_at: "2024-01-16T09:00:00Z",
    updated_at: "2024-01-16T09:00:00Z",
  },
  {
    id: "prod-004",
    temple_id: "temple-001",
    name: "Mural Elephant Statue",
    type: "physical",
    cost_to_runner: 25.0,
    evidence_required: ["photo_after"],
    notes: "Decorative wooden elephant for shrine",
    is_active: true,
    created_at: "2024-06-01T10:00:00Z",
    updated_at: "2024-06-01T10:00:00Z",
  },
  {
    id: "prod-005",
    temple_id: "temple-001",
    name: "Dan Performing Service",
    type: "service",
    cost_to_runner: 50.0,
    evidence_required: ["video"],
    notes: "Hire traditional dancers to perform at shrine on customer's behalf",
    is_active: true,
    created_at: "2024-01-16T09:30:00Z",
    updated_at: "2024-01-16T09:30:00Z",
  },
  {
    id: "prod-006",
    temple_id: "temple-001",
    name: "General Donation",
    type: "donation",
    cost_to_runner: 0,
    evidence_required: ["receipt"],
    notes: "Cash donation to shrine fund",
    is_active: true,
    created_at: "2024-01-16T10:00:00Z",
    updated_at: "2024-01-16T10:00:00Z",
  },

  // ── Wat Pho products ───────────────────────────────────────────────────
  {
    id: "prod-007",
    temple_id: "temple-002",
    name: "Golden Leaf (Buddha Offering)",
    type: "physical",
    cost_to_runner: 3.0,
    evidence_required: ["photo_after"],
    notes: "Small sheet of gold leaf for Buddha statue",
    is_active: true,
    created_at: "2024-02-11T08:00:00Z",
    updated_at: "2024-02-11T08:00:00Z",
  },
  {
    id: "prod-008",
    temple_id: "temple-002",
    name: "Incense & Candles Set",
    type: "physical",
    cost_to_runner: 5.0,
    evidence_required: ["photo_after"],
    notes: "Set of incense sticks and candles",
    is_active: true,
    created_at: "2024-02-11T08:30:00Z",
    updated_at: "2024-02-11T08:30:00Z",
  },
  {
    id: "prod-009",
    temple_id: "temple-002",
    name: "Monk Blessing Service",
    type: "service",
    cost_to_runner: 30.0,
    evidence_required: ["photo_after", "video"],
    notes: "Arrange for a monk to perform personalised blessing",
    is_active: true,
    created_at: "2024-02-11T09:00:00Z",
    updated_at: "2024-02-11T09:00:00Z",
  },
  {
    id: "prod-010",
    temple_id: "temple-002",
    name: "Donation to Temple Fund",
    type: "donation",
    cost_to_runner: 0,
    evidence_required: ["receipt"],
    notes: "General donation to Wat Pho conservation fund",
    is_active: true,
    created_at: "2024-02-11T09:30:00Z",
    updated_at: "2024-02-11T09:30:00Z",
  },

  // ── Wat Arun products ──────────────────────────────────────────────────
  {
    id: "prod-011",
    temple_id: "temple-003",
    name: "Lotus Flower Bouquet",
    type: "physical",
    cost_to_runner: 8.0,
    evidence_required: ["photo_after"],
    notes: "Fresh lotus flowers arranged for offering",
    is_active: true,
    created_at: "2024-03-23T08:00:00Z",
    updated_at: "2024-03-23T08:00:00Z",
  },
  {
    id: "prod-012",
    temple_id: "temple-003",
    name: "Candle Lantern",
    type: "physical",
    cost_to_runner: 12.0,
    evidence_required: ["photo_after"],
    notes: "Decorative candle lantern for evening ceremony",
    is_active: true,
    created_at: "2024-03-23T08:30:00Z",
    updated_at: "2024-03-23T08:30:00Z",
  },
  {
    id: "prod-013",
    temple_id: "temple-003",
    name: "Evening Prayer Service",
    type: "service",
    cost_to_runner: 40.0,
    evidence_required: ["video"],
    notes: "Evening prayer ceremony at the main prang",
    is_active: true,
    created_at: "2024-03-23T09:00:00Z",
    updated_at: "2024-03-23T09:00:00Z",
  },

  // ── Kek Lok Si products ────────────────────────────────────────────────
  {
    id: "prod-014",
    temple_id: "temple-004",
    name: "Joss Paper Pack",
    type: "physical",
    cost_to_runner: 3.5,
    evidence_required: ["photo_after"],
    notes: "Pack of joss paper for burning ceremony",
    is_active: true,
    created_at: "2024-05-06T08:00:00Z",
    updated_at: "2024-05-06T08:00:00Z",
  },
  {
    id: "prod-015",
    temple_id: "temple-004",
    name: "Oil Lamp Set",
    type: "physical",
    cost_to_runner: 15.0,
    evidence_required: ["photo_after"],
    notes: "Set of oil lamps for dedication",
    is_active: true,
    created_at: "2024-05-06T08:30:00Z",
    updated_at: "2024-05-06T08:30:00Z",
  },
  {
    id: "prod-016",
    temple_id: "temple-004",
    name: "Full Ceremony Package",
    type: "service",
    cost_to_runner: 80.0,
    evidence_required: ["photo_after", "video"],
    notes: "Complete Buddhist ceremony with monks",
    is_active: true,
    created_at: "2024-05-06T09:00:00Z",
    updated_at: "2024-05-06T09:00:00Z",
  },
];

// ============================================================================
// PACKAGES (4)
// ============================================================================

export const mockPackages: Package[] = [
  {
    id: "pkg-001",
    temple_id: "temple-001",
    name: "精要套餐 Essence",
    description:
      "A simple yet sincere offering of fresh flower garlands, incense, and candles at Erawan Shrine. Ideal for a first-time blessing.",
    selling_price: 198,
    status: "active",
    evidence_sop: {
      steps: [
        "Photograph offerings before placement",
        "Place items at designated shrine area",
        "Photograph completed offering",
      ],
      photo_count: 2,
    },
    photos: [
      "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800",
    ],
    created_at: "2024-01-20T12:00:00Z",
    updated_at: "2025-06-15T09:00:00Z",
  },
  {
    id: "pkg-002",
    temple_id: "temple-001",
    name: "诚心套餐 Devotion",
    description:
      "An extended offering including the Essence items plus coconut offerings and a mural elephant statue for lasting dedication.",
    selling_price: 289,
    status: "active",
    evidence_sop: {
      steps: [
        "Photograph all items before placement",
        "Place offerings in order",
        "Photograph completed shrine",
        "Submit cost receipt",
      ],
      photo_count: 3,
    },
    photos: [
      "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800",
    ],
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2025-06-15T09:30:00Z",
  },
  {
    id: "pkg-003",
    temple_id: "temple-002",
    name: "丰盛套餐 Abundance",
    description:
      "A complete offering at Wat Pho featuring gold leaf, incense, candles, and a monk blessing service.",
    selling_price: 438,
    status: "active",
    evidence_sop: {
      steps: [
        "Photograph all offerings before placement",
        "Gold leaf application to Buddha",
        "Light incense and candles",
        "Monk blessing ceremony (video required)",
        "Photograph final result",
      ],
      photo_count: 3,
    },
    photos: [
      "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800",
    ],
    created_at: "2024-03-01T14:00:00Z",
    updated_at: "2025-03-20T11:00:00Z",
  },
  {
    id: "pkg-004",
    temple_id: "temple-004",
    name: "盛大供养 Grand Offering",
    description:
      "A premium package at Kek Lok Si including joss paper, oil lamps, and a full Buddhist ceremony with monks.",
    selling_price: 698,
    status: "active",
    evidence_sop: {
      steps: [
        "Photograph all items before ceremony",
        "Light oil lamps",
        "Burn joss paper",
        "Full monk ceremony (video required)",
        "Final photograph",
      ],
      photo_count: 4,
    },
    photos: [
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800",
    ],
    created_at: "2024-06-10T08:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
];

// ============================================================================
// PACKAGE → PRODUCT LINKS
// ============================================================================

export const mockPackageProducts: PackageProduct[] = [
  // Essence (pkg-001) → prod-001, prod-002
  { id: "pp-001", package_id: "pkg-001", product_id: "prod-001", quantity: 2 },
  { id: "pp-002", package_id: "pkg-001", product_id: "prod-002", quantity: 3 },

  // Devotion (pkg-002) → prod-001, prod-002, prod-003, prod-004
  { id: "pp-003", package_id: "pkg-002", product_id: "prod-001", quantity: 3 },
  { id: "pp-004", package_id: "pkg-002", product_id: "prod-002", quantity: 5 },
  { id: "pp-005", package_id: "pkg-002", product_id: "prod-003", quantity: 2 },
  { id: "pp-006", package_id: "pkg-002", product_id: "prod-004", quantity: 1 },

  // Abundance (pkg-003) → prod-007, prod-008, prod-009, prod-010 (donation=RM35)
  { id: "pp-007", package_id: "pkg-003", product_id: "prod-007", quantity: 4 },
  { id: "pp-008", package_id: "pkg-003", product_id: "prod-008", quantity: 2 },
  { id: "pp-009", package_id: "pkg-003", product_id: "prod-009", quantity: 1 },

  // Grand Offering (pkg-004) → prod-014, prod-015, prod-016
  { id: "pp-010", package_id: "pkg-004", product_id: "prod-014", quantity: 5 },
  { id: "pp-011", package_id: "pkg-004", product_id: "prod-015", quantity: 3 },
  { id: "pp-012", package_id: "pkg-004", product_id: "prod-016", quantity: 1 },
];

// ============================================================================
// RUNNERS (3)
// ============================================================================

export const mockRunners: Runner[] = [
  {
    id: "runner-001",
    name: "Somchai Jaidee",
    phone: "+66 81 234 5678",
    email: "somchai@runner.co.th",
    tier: "gold",
    quality_score: 4.8,
    status: "active",
    return_rate: 2.3,
    notes: "Highly reliable. Specialises in Erawan Shrine & Wat Pho. 47 orders completed.",
    created_at: "2024-01-10T06:00:00Z",
    updated_at: "2025-12-10T12:00:00Z",
  },
  {
    id: "runner-002",
    name: "Anong Kittisak",
    phone: "+66 89 876 5432",
    email: "anong@runner.co.th",
    tier: "silver",
    quality_score: 4.5,
    status: "active",
    return_rate: 5.1,
    notes: "Covers Bangkok central. Good with Wat Pho ceremonies. 31 orders completed.",
    created_at: "2024-03-15T08:00:00Z",
    updated_at: "2025-11-25T15:00:00Z",
  },
  {
    id: "runner-003",
    name: "Malee Boonmee",
    phone: "+60 12 345 6789",
    email: "malee@runner.my",
    tier: "bronze",
    quality_score: 4.2,
    status: "active",
    return_rate: 8.7,
    notes: "Based in Penang. Covers Kek Lok Si. New to the platform — 12 orders completed.",
    created_at: "2024-06-20T04:00:00Z",
    updated_at: "2025-10-02T09:00:00Z",
  },
];

// ============================================================================
// RUNNER ↔ TEMPLE ASSIGNMENTS
// ============================================================================

export const mockRunnerTemples: { runner_id: string; temple_id: string }[] = [
  { runner_id: "runner-001", temple_id: "temple-001" },
  { runner_id: "runner-001", temple_id: "temple-002" },
  { runner_id: "runner-001", temple_id: "temple-003" },
  { runner_id: "runner-002", temple_id: "temple-002" },
  { runner_id: "runner-002", temple_id: "temple-003" },
  { runner_id: "runner-003", temple_id: "temple-004" },
];

// ============================================================================
// CUSTOMERS (4)
// ============================================================================

export const mockCustomers: Customer[] = [
  {
    id: "cust-001",
    name: "王小明",
    email: "xiaoming.wang@example.com",
    phone: "+86 138 0013 8000",
    segment: "repeat",
    total_orders: 5,
    total_spent: 1290,
    created_at: "2024-04-01T02:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
  },
  {
    id: "cust-002",
    name: "Sarah Tan",
    email: "sarah.tan@example.sg",
    phone: "+65 9123 4567",
    segment: "vip",
    total_orders: 12,
    total_spent: 4380,
    created_at: "2024-02-20T04:00:00Z",
    updated_at: "2025-12-05T14:00:00Z",
  },
  {
    id: "cust-003",
    name: "Ah Mei",
    email: "ah.mei@example.my",
    phone: "+60 19 876 5432",
    segment: "vow_fulfiller",
    total_orders: 3,
    total_spent: 894,
    created_at: "2024-07-10T06:00:00Z",
    updated_at: "2025-11-20T18:00:00Z",
  },
  {
    id: "cust-004",
    name: "David Lim",
    email: "david.lim@example.sg",
    phone: "+65 8765 4321",
    segment: "one_time",
    total_orders: 1,
    total_spent: 198,
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
];

// ============================================================================
// ORDERS (7)
// ============================================================================

const _mockOrdersRaw: Order[] = [
  {
    id: "order-001",
    order_number: "BLV-20251210-001",
    customer_id: "cust-001",
    temple_id: "temple-001",
    package_id: "pkg-001",
    runner_id: "runner-001",
    selling_price: 198,
    status: "completed",
    customer_name: "王小明",
    customer_phone: "+86 138 0013 8000",
    special_instructions: "Please place offerings at the Brahma statue and take a photo with the morning light.",
    evidence_submitted: [
      { type: "photo", url: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400", label: "Completed Offering" },
      { type: "photo", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", label: "Close-up" },
    ],
    review_notes: "Beautiful photos, very clear evidence. Well done.",
    reviewed_at: "2025-11-28T06:30:00Z",
    completed_at: "2025-11-28T06:25:00Z",
    created_at: "2025-11-25T02:00:00Z",
    updated_at: "2025-11-28T06:30:00Z",
  },
  {
    id: "order-002",
    order_number: "BLV-20251208-002",
    customer_id: "cust-002",
    temple_id: "temple-003",
    package_id: "pkg-002",
    runner_id: "runner-002",
    selling_price: 289,
    status: "in_progress",
    customer_name: "Sarah Tan",
    customer_phone: "+65 9123 4567",
    special_instructions: "Evening ceremony preferred. Capture sunset if possible. Vow: health for my mother.",
    evidence_submitted: [],
    created_at: "2025-12-06T04:00:00Z",
    updated_at: "2025-12-08T10:00:00Z",
  },
  {
    id: "order-003",
    order_number: "BLV-20251209-003",
    customer_id: "cust-003",
    temple_id: "temple-004",
    package_id: "pkg-004",
    runner_id: "runner-003",
    selling_price: 698,
    status: "in_review",
    customer_name: "Ah Mei",
    customer_phone: "+60 19 876 5432",
    special_instructions: "Full ceremony for Vesak dedication. Include oil lamp with my mother's name: Poh Lian.",
    evidence_submitted: [
      { type: "photo", url: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=400", label: "Oil Lamps" },
      { type: "photo", url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400", label: "Joss Paper Burning" },
      { type: "video", url: "https://example.com/videos/ceremony-003.mp4", label: "Monk Ceremony (1:32)" },
    ],
    created_at: "2025-12-07T02:00:00Z",
    updated_at: "2025-12-09T08:45:00Z",
  },
  {
    id: "order-004",
    order_number: "BLV-20251211-004",
    customer_id: "cust-002",
    temple_id: "temple-002",
    package_id: "pkg-003",
    runner_id: undefined,
    selling_price: 438,
    status: "unassigned",
    customer_name: "Sarah Tan",
    customer_phone: "+65 9123 4567",
    special_instructions: "I need the monk blessing to include my full name in the dedication: Sarah Tan Pei Ling.",
    evidence_submitted: [],
    created_at: "2025-12-10T06:00:00Z",
    updated_at: "2025-12-10T06:00:00Z",
  },
  {
    id: "order-005",
    order_number: "BLV-20251205-005",
    customer_id: "cust-004",
    temple_id: "temple-001",
    package_id: "pkg-001",
    runner_id: "runner-001",
    selling_price: 198,
    status: "paid",
    customer_name: "David Lim",
    customer_phone: "+65 8765 4321",
    special_instructions: "First time ordering. Just a simple blessing for good luck in my new job.",
    evidence_submitted: [],
    created_at: "2025-12-05T03:00:00Z",
    updated_at: "2025-12-05T03:00:00Z",
  },
  {
    id: "order-006",
    order_number: "BLV-20251120-006",
    customer_id: "cust-001",
    temple_id: "temple-002",
    package_id: "pkg-003",
    runner_id: "runner-002",
    selling_price: 438,
    status: "completed",
    customer_name: "王小明",
    customer_phone: "+86 138 0013 8000",
    special_instructions: "Gold leaf for my grandfather's birthday blessing.",
    evidence_submitted: [
      { type: "photo", url: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400", label: "Gold Leaf Application" },
      { type: "video", url: "https://example.com/videos/blessing-006.mp4", label: "Monk Blessing (2:15)" },
    ],
    review_notes: "Excellent video and clear photos. Customer verified.",
    reviewed_at: "2025-11-22T09:00:00Z",
    completed_at: "2025-11-22T08:50:00Z",
    created_at: "2025-11-20T04:00:00Z",
    updated_at: "2025-11-22T09:00:00Z",
  },
  {
    id: "order-007",
    order_number: "BLV-20251015-007",
    customer_id: "cust-002",
    temple_id: "temple-003",
    package_id: "pkg-002",
    runner_id: "runner-001",
    selling_price: 289,
    status: "disputed",
    customer_name: "Sarah Tan",
    customer_phone: "+65 9123 4567",
    special_instructions: "Please do sunset prayer ceremony. Very important to me.",
    evidence_submitted: [
      { type: "photo", url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400", label: "Offering Placement" },
    ],
    review_notes: "Customer says the ceremony was not performed properly.",
    created_at: "2025-10-12T06:00:00Z",
    updated_at: "2025-10-18T12:00:00Z",
  },
];

// Export orders with joined FK data resolved.
export const mockOrders: Order[] = _mockOrdersRaw.map(hydrateOrder);

// ============================================================================
// RECEIPTS (4)
// ============================================================================

export const mockReceipts: RunnerReceipt[] = [
  {
    id: "receipt-001",
    order_id: "order-001",
    runner_id: "runner-001",
    product_cost: 21.0,
    transport_cost: 8.5,
    other_cost: 5.0,
    receipt_url: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400",
    status: "verified",
    submitted_at: "2025-11-28T07:00:00Z",
    verified_at: "2025-11-29T10:00:00Z",
    notes: "Taxi receipt included. All costs verified.",
    created_at: "2025-11-28T07:00:00Z",
  },
  {
    id: "receipt-002",
    order_id: "order-003",
    runner_id: "runner-003",
    product_cost: 58.5,
    transport_cost: 12.0,
    other_cost: 15.0,
    receipt_url: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400",
    status: "received",
    submitted_at: "2025-12-09T09:00:00Z",
    notes: "Ferry included in transport cost. Monk donation receipt attached.",
    created_at: "2025-12-09T09:00:00Z",
  },
  {
    id: "receipt-003",
    order_id: "order-006",
    runner_id: "runner-002",
    product_cost: 44.0,
    transport_cost: 6.0,
    other_cost: 3.5,
    receipt_url: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400",
    status: "verified",
    submitted_at: "2025-11-22T09:30:00Z",
    verified_at: "2025-11-23T14:00:00Z",
    notes: "Clean submission. All receipts match invoice.",
    created_at: "2025-11-22T09:30:00Z",
  },
  {
    id: "receipt-004",
    order_id: "order-007",
    runner_id: "runner-001",
    product_cost: 32.5,
    transport_cost: 15.0,
    other_cost: 10.0,
    receipt_url: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400",
    status: "rejected",
    submitted_at: "2025-10-17T08:00:00Z",
    notes: "Missing receipt for transport cost. Runner to re-submit.",
    created_at: "2025-10-17T08:00:00Z",
  },
];

// ============================================================================
// DISPUTES (1)
// ============================================================================

export const mockDisputes: Dispute[] = [
  {
    id: "dispute-001",
    order_id: "order-007",
    customer_id: "cust-002",
    reason: "incomplete_service",
    customer_claim:
      "I specifically requested a sunset prayer ceremony but the photos only show daytime. The runner clearly did not follow my instructions. I want a full refund or a re-do.",
    runner_response:
      "There was unexpected heavy rain at sunset time, making it unsafe to perform the outdoor ceremony. I did perform the ceremony at an earlier time as a compromise and offered to do a follow-up at no charge. The customer declined.",
    resolution: "pending",
    refund_amount: 0,
    status: "open",
    admin_notes: "Customer is a VIP with 12 orders. Runner has gold tier. Need photos from runner to verify rain conditions. Recommend partial refund of RM100 as goodwill gesture.",
    created_at: "2025-10-18T13:00:00Z",
  },
];

// ============================================================================
// NOTIFICATIONS (5)
// ============================================================================

export const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    type: "warning",
    message: "Order BLV-20251209-003 has evidence pending review for 3+ hours.",
    link: "/orders/order-003",
    is_read: false,
    created_at: "2025-12-10T12:00:00Z",
  },
  {
    id: "notif-002",
    type: "error",
    message: "Dispute opened for order BLV-20251015-007 — customer Sarah Tan claims incomplete service.",
    link: "/disputes/dispute-001",
    is_read: false,
    created_at: "2025-10-18T13:30:00Z",
  },
  {
    id: "notif-003",
    type: "info",
    message: "New runner assignment: Anong Kittisak assigned to order BLV-20251208-002 at Wat Arun.",
    link: "/orders/order-002",
    is_read: true,
    created_at: "2025-12-08T10:05:00Z",
  },
  {
    id: "notif-004",
    type: "success",
    message: "Order BLV-20251120-006 (王小明) completed successfully. Evidence approved.",
    link: "/orders/order-006",
    is_read: true,
    created_at: "2025-11-22T09:10:00Z",
  },
  {
    id: "notif-005",
    type: "info",
    message: "New temple request received: 'Senso-ji Temple' in Tokyo, Japan — requested by 3 customers.",
    link: "/temple-requests/tr-001",
    is_read: false,
    created_at: "2025-12-09T15:00:00Z",
  },
];

// ============================================================================
// SETTINGS (4)
// ============================================================================

export const mockSettings: Setting[] = [
  {
    id: "setting-001",
    key: "currency",
    value: "MYR",
    description: "Default currency for all prices",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "setting-002",
    key: "dispute_auto_escalate_hours",
    value: "48",
    description: "Auto-escalate unresolved dispute after N hours",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "setting-003",
    key: "runner_fee_percentage",
    value: "15",
    description: "Platform commission on each order (percentage)",
    updated_at: "2024-06-01T00:00:00Z",
  },
  {
    id: "setting-004",
    key: "maintenance_mode",
    value: "false",
    description: "Enable to pause order processing",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// ============================================================================
// TEMPLE REQUESTS (3)
// ============================================================================

export const mockTempleRequests: TempleRequest[] = [
  {
    id: "tr-001",
    temple_name: "Sensō-ji Temple",
    country: "Japan",
    city: "Tokyo",
    requested_by: "23 customers",
    request_count: 23,
    status: "pending",
    notes: "High demand from Japan-based customers. Asakusa ward, Tokyo. Famous ancient Buddhist temple.",
    created_at: "2025-12-09T14:00:00Z",
  },
  {
    id: "tr-002",
    temple_name: "Bagan Temples",
    country: "Myanmar",
    city: "Mandalay Region",
    requested_by: "11 customers",
    request_count: 11,
    status: "researching",
    notes:
      "Ancient temple complex. Need to identify specific temples with active worship. Travel logistics to be confirmed.",
    created_at: "2025-11-15T09:00:00Z",
  },
  {
    id: "tr-003",
    temple_name: "Thian Hock Keng",
    country: "Singapore",
    city: "Singapore",
    requested_by: "8 customers",
    request_count: 8,
    status: "approved",
    notes:
      "Historic Hokkien temple in Telok Ayer Street. Easy logistics from Malaysia base. Ready for runner onboarding.",
    created_at: "2025-10-01T11:00:00Z",
  },
];

// ============================================================================
// RUNNER PAYMENTS (2 — bonus data)
// ============================================================================

export const mockRunnerPayments: RunnerPayment[] = [
  {
    id: "pay-001",
    runner_id: "runner-001",
    period_start: "2025-11-01",
    period_end: "2025-11-30",
    total_reimbursable: 142.5,
    amount_paid: 142.5,
    status: "paid",
    paid_at: "2025-12-02T10:00:00Z",
    notes: "November reimbursement — 4 orders",
    created_at: "2025-12-02T10:00:00Z",
  },
  {
    id: "pay-002",
    runner_id: "runner-002",
    period_start: "2025-11-01",
    period_end: "2025-11-30",
    total_reimbursable: 98.0,
    amount_paid: 0,
    status: "pending",
    notes: "November reimbursement — 3 orders. Pending receipt verification.",
    created_at: "2025-12-02T10:00:00Z",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SYNCHRONOUS ACCESSORS
// ═══════════════════════════════════════════════════════════════════════════

export const getTemples = (): Temple[] => mockTemples;
export const getPackages = (): Package[] => mockPackages;
export const getRunners = (): Runner[] => mockRunners;
export const getCustomers = (): Customer[] => mockCustomers;
export const getOrders = (): Order[] => mockOrders;
export const getReceipts = (): RunnerReceipt[] => mockReceipts;
export const getDisputes = (): Dispute[] => mockDisputes;
export const getNotifications = (): Notification[] => mockNotifications;
export const getSettings = (): Setting[] => mockSettings;
export const getTempleRequests = (): TempleRequest[] => mockTempleRequests;
export const getPackageProducts = (): PackageProduct[] => mockPackageProducts;
export const getRunnerTemples = (): { runner_id: string; temple_id: string }[] =>
  mockRunnerTemples;
export const getRunnerPayments = (): RunnerPayment[] => mockRunnerPayments;
export const getProducts = (): Product[] => mockProducts;

// ── By-ID lookups (sync) ────────────────────────────────────────────────────

export const getTempleById = (id: string): Temple | undefined =>
  mockTemples.find((t) => t.id === id);

export const getPackageById = (id: string): Package | undefined =>
  mockPackages.find((p) => p.id === id);

export const getOrderById = (id: string): Order | undefined =>
  mockOrders.find((o) => o.id === id);

export const getRunnerById = (id: string): Runner | undefined =>
  mockRunners.find((r) => r.id === id);

export const getCustomerById = (id: string): Customer | undefined =>
  mockCustomers.find((c) => c.id === id);

export const getDisputeById = (id: string): Dispute | undefined =>
  mockDisputes.find((d) => d.id === id);

export const getReceiptById = (id: string): RunnerReceipt | undefined =>
  mockReceipts.find((r) => r.id === id);

export const getTempleRequestById = (id: string): TempleRequest | undefined =>
  mockTempleRequests.find((tr) => tr.id === id);

// ── Filter helpers ──────────────────────────────────────────────────────────

export const getOrdersByTemple = (templeId: string): Order[] =>
  mockOrders.filter((o) => o.temple_id === templeId);

export const getOrdersByRunner = (runnerId: string): Order[] =>
  mockOrders.filter((o) => o.runner_id === runnerId);

export const getOrdersByCustomer = (customerId: string): Order[] =>
  mockOrders.filter((o) => o.customer_id === customerId);

export const getOrdersByStatus = (status: Order["status"]): Order[] =>
  mockOrders.filter((o) => o.status === status);

export const getPackagesByTemple = (templeId: string): Package[] =>
  mockPackages.filter((p) => p.temple_id === templeId);

export const getReceiptsByOrder = (orderId: string): RunnerReceipt[] =>
  mockReceipts.filter((r) => r.order_id === orderId);

export const getProductsByTemple = (templeId: string): Product[] =>
  mockProducts.filter((p) => p.temple_id === templeId);

export const getUnreadNotifications = (): Notification[] =>
  mockNotifications.filter((n) => !n.is_read);

// ═══════════════════════════════════════════════════════════════════════════
// ASYNC ACCESSORS (simulate ~150 ms network delay)
// ═══════════════════════════════════════════════════════════════════════════

const delay = <T>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), 150));

export const getTemplesAsync = (): Promise<Temple[]> => delay(mockTemples);
export const getPackagesAsync = (): Promise<Package[]> => delay(mockPackages);
export const getRunnersAsync = (): Promise<Runner[]> => delay(mockRunners);
export const getCustomersAsync = (): Promise<Customer[]> => delay(mockCustomers);
export const getOrdersAsync = (): Promise<Order[]> => delay(mockOrders);
export const getReceiptsAsync = (): Promise<RunnerReceipt[]> => delay(mockReceipts);
export const getDisputesAsync = (): Promise<Dispute[]> => delay(mockDisputes);
export const getNotificationsAsync = (): Promise<Notification[]> =>
  delay(mockNotifications);
export const getSettingsAsync = (): Promise<Setting[]> => delay(mockSettings);
export const getTempleRequestsAsync = (): Promise<TempleRequest[]> =>
  delay(mockTempleRequests);
export const getPackageProductsAsync = (): Promise<PackageProduct[]> =>
  delay(mockPackageProducts);
export const getRunnerTemplesAsync = (): Promise<
  { runner_id: string; temple_id: string }[]
> => delay(mockRunnerTemples);
export const getRunnerPaymentsAsync = (): Promise<RunnerPayment[]> =>
  delay(mockRunnerPayments);
export const getProductsAsync = (): Promise<Product[]> => delay(mockProducts);

// ── By-ID lookups (async) ───────────────────────────────────────────────────

export const getTempleByIdAsync = (id: string): Promise<Temple | undefined> =>
  delay(getTempleById(id));

export const getPackageByIdAsync = (id: string): Promise<Package | undefined> =>
  delay(getPackageById(id));

export const getOrderByIdAsync = (id: string): Promise<Order | undefined> =>
  delay(getOrderById(id));

export const getRunnerByIdAsync = (id: string): Promise<Runner | undefined> =>
  delay(getRunnerById(id));

export const getCustomerByIdAsync = (id: string): Promise<Customer | undefined> =>
  delay(getCustomerById(id));

export const getDisputeByIdAsync = (id: string): Promise<Dispute | undefined> =>
  delay(getDisputeById(id));

export const getReceiptByIdAsync = (id: string): Promise<RunnerReceipt | undefined> =>
  delay(getReceiptById(id));

export const getTempleRequestByIdAsync = (
  id: string,
): Promise<TempleRequest | undefined> => delay(getTempleRequestById(id));

// ── Filter helpers (async) ──────────────────────────────────────────────────

export const getOrdersByTempleAsync = (templeId: string): Promise<Order[]> =>
  delay(getOrdersByTemple(templeId));

export const getOrdersByRunnerAsync = (runnerId: string): Promise<Order[]> =>
  delay(getOrdersByRunner(runnerId));

export const getOrdersByCustomerAsync = (customerId: string): Promise<Order[]> =>
  delay(getOrdersByCustomer(customerId));

export const getOrdersByStatusAsync = (status: Order["status"]): Promise<Order[]> =>
  delay(getOrdersByStatus(status));

export const getPackagesByTempleAsync = (templeId: string): Promise<Package[]> =>
  delay(getPackagesByTemple(templeId));

export const getReceiptsByOrderAsync = (
  orderId: string,
): Promise<RunnerReceipt[]> => delay(getReceiptsByOrder(orderId));

export const getProductsByTempleAsync = (templeId: string): Promise<Product[]> =>
  delay(getProductsByTemple(templeId));

export const getUnreadNotificationsAsync = (): Promise<Notification[]> =>
  delay(getUnreadNotifications());
