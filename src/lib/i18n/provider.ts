/**
 * Provider portal dictionary (en / zh). Simplified Chinese for Malaysian Chinese
 * small-business owners: plain, polite, operational. Currency stays "RM"; order
 * numbers/receipts keep their original form. Fixed terminology per Phase 5C-B.
 * Kept beside the customer dictionaries; self-contained so en/zh stay matched.
 */
export type ProviderLang = "en" | "zh";
export const PROVIDER_LANG_COOKIE = "yc_provider_lang";

const en = {
  lang: { en: "EN", zh: "中文" },
  nav: {
    brand: "Yuancheng Provider",
    Overview: "Overview", Sell: "Sell", Operate: "Operate", Account: "Account",
    dashboard: "Dashboard", storefront: "Storefront", services: "Services",
    products: "Products", orders: "Orders", customers: "Customers",
    subscription: "Subscription", account: "Account", logout: "Logout", verifying: "Verifying access…",
  },
  dash: {
    greeting: "Good day", verified: "Verified provider",
    needsAttention: "Needs attention", nothing: "Nothing needs your attention right now.",
    proofReview: "Payment proof awaiting review", readyAccept: "Order ready to accept", inProgress: "Fulfilment in progress",
    thisWeek: "This week", orders: "Orders", completed: "Completed", orderValue: "Order value",
    quickActions: "Quick actions", createService: "Create service", viewOrders: "View orders", editStorefront: "Edit storefront",
    catalog: "Catalog", activeServices: "Active services", products: "Products", plan: "Plan", freeBeta: "Free (beta)",
  },
  orders: {
    title: "Orders", subtitle: "Review requests, verify payments, and fulfil orders.",
    all: "All", review: "Payment review", paid: "Paid", progress: "In progress", completed: "Completed",
    empty: "No orders here", emptyBody: "Orders in this state will appear here.",
  },
  od: {
    back: "Orders", nextAction: "Next action", noFurther: "No further action needed.",
    customerRequest: "Customer request", package: "Package", amount: "Amount", place: "Place",
    fulfilment: "Fulfilment", provider: "Provider", evidenceRequired: "Evidence required",
    none: "None", photo: "Photo", photoVideo: "Photo + video",
    paymentReview: "Payment review", uploadWarn: "A receipt upload does not mean payment is verified. Check your bank before verifying.",
    amountDue: "Amount due", reference: "Reference", uploaded: "Uploaded", method: "Method",
    checkBank: "Check in your bank app: amount {amount}, reference {ref}.",
    paymentDetails: "Payment details", payment: "Payment", verifiedSummary: "Verified · {amount} · {date}",
    submitEvidenceTitle: "Submit completion evidence", requiredLine: "Required: {ev}. Add your records, then submit.",
    addPhoto: "Add photo", addVideo: "Add video", completionEvidence: "Completion evidence",
    progress: "Progress", demoNote: "Demo: actions update this screen only (not persisted).",
    paymentIssue: "Payment issue", receiptRejected: "Receipt rejected. The customer can upload a new receipt.",
    assignment: "Assignment", paymentReceipt: "Payment receipt",
    actions: {
      verify_payment: "Verify payment", reject_receipt: "Reject receipt", accept_order: "Accept order",
      start_fulfilment: "Start fulfilment", submit_evidence: "Submit evidence", complete_order: "Complete order",
      cant_fulfil: "Can't fulfil this order", mark_refund_sent: "Mark refund as sent", upload_proof: "Upload payment proof",
    },
    steps: {
      proofSubmitted: "Payment proof submitted", paymentVerified: "Payment verified", accepted: "Accepted",
      fulfilmentStarted: "Fulfilment started", evidenceSubmitted: "Evidence submitted", completed: "Completed",
    },
    dlg: {
      cantfulfilTitle: "Can't fulfil this order?",
      cantfulfilBody: "The order will move to Refund requested. You will refund the customer {amount} directly. Yuancheng does not hold or transfer money.",
      keepOrder: "Keep order", yesStartRefund: "Yes, start refund",
      rejectTitle: "Reject receipt?", rejectBody: "The customer will be asked to upload a new receipt.",
      reason: "Reason", cancel: "Cancel", rejectReceipt: "Reject receipt",
    },
  },
  services: {
    title: "Services", subtitle: "Your service listings and their packages.", create: "Create service",
    empty: "No services yet", emptyCta: "Create your first service", published: "Published", packages: "packages",
    newTitle: "Create service", newSub: "Describe the service. Packages are added after saving.",
    name: "Service name", description: "Description", guidance: "Request guidance (shown to the customer)",
    placeField: "Place", evidence: "Evidence", visibility: "Customer visibility", auto: "Automatic", approval: "Approval required",
    customerPhoto: "Customer photo", off: "Off", optional: "Optional", required: "Required",
    save: "Save service", cancel: "Cancel", demoNote: "Demo: saving is disabled until repositories are wired.",
  },
  products: {
    title: "Products", subtitle: "Physical products. Customers contact you to buy — no Yuancheng checkout.",
    add: "Add product", empty: "No products yet", emptyBody: "Add a product to show it on your storefront.",
    physical: "Physical", contactProvider: "Contact provider",
    newTitle: "Add product", newSub: "Physical product — sold outside Yuancheng (Contact provider).",
    name: "Product name", description: "Description", priceRM: "Price (RM)", status: "Status",
    published: "Published", draft: "Draft", save: "Save product",
    demoNote: "Demo: no cart, checkout, payment, shipping or inventory. Save disabled until repositories are wired.",
  },
  customers: {
    title: "Customers", subtitle: "People who have ordered from you.",
    empty: "No customers yet", emptyBody: "Customers will appear here after your first order.",
    order: "order", orders: "orders", last: "last", orderHistory: "Order history", notFound: "Customer not found",
  },
  sub: {
    title: "Subscription", subtitle: "Your plan and capacity.", free: "Free",
    freeDesc: "Free during beta · Platform commission 0%", active: "Active",
    overLimit: "You’re currently over your plan allowance. Existing listings stay active — review your catalog or increase capacity.",
    capacity: "Capacity", services: "Services", products: "Products", staff: "Staff", runner: "Runner", evidence: "Evidence",
    enabled: "Enabled", disabled: "Disabled", unlimited: "unlimited",
    reviewCatalog: "Review catalog", increaseCapacity: "Increase capacity",
    note: "Paid plans and pricing are not enabled in the beta.",
  },
  acct: {
    title: "Account", subtitle: "Business details, verification and how customers pay you.",
    businessInfo: "Business information", businessName: "Business name", location: "Location",
    verification: "Verification", identity: "Identity", business: "Business", physicalLocation: "Physical location",
    verified: "Verified", pending: "Pending",
    verificationNote: "Verified provider. Verification confirms identity and business — it is not an endorsement by any place, and Yuancheng does not guarantee outcomes.",
    paymentMethods: "Your payment details", addMethod: "Add method",
    paymentNote: "How customers pay you directly (Stage 1). This is your account — not a Yuancheng payout account.",
    accountName: "Account name", accountNumber: "Account number", duitnow: "DuitNow QR",
    security: "Security", email: "Email", password: "Password", change: "Change",
  },
  store: {
    title: "Storefront", subtitle: "What your customers see.", preview: "Preview storefront",
    businessProfile: "Business profile", published: "Published", businessName: "Business name", location: "Location",
    about: "About", services: "Services", products: "Products", manage: "Manage",
    fulfilmentInfo: "Fulfilment information",
    fulfilmentBody: "Orders are fulfilled by the provider. Payment is made directly to the provider (Stage 1).",
  },
  login: {
    title: "Provider Portal", subtitle: "Manage your services, storefront and orders.",
    email: "Email", password: "Password", signIn: "Sign in", signingIn: "Signing in…",
    create: "Create provider account", back: "Back to Yuancheng",
    invalid: "Incorrect email or password.", unavailable: "Sign-in is not available right now.",
  },
};

const zh: typeof en = {
  lang: { en: "EN", zh: "中文" },
  nav: {
    brand: "愿成 服务商",
    Overview: "概览", Sell: "销售", Operate: "运营", Account: "账户",
    dashboard: "仪表板", storefront: "店铺", services: "服务",
    products: "商品", orders: "订单", customers: "客户",
    subscription: "订阅", account: "账户", logout: "退出", verifying: "正在验证访问权限…",
  },
  dash: {
    greeting: "您好", verified: "已核实服务商",
    needsAttention: "待处理事项", nothing: "目前没有待处理事项。",
    proofReview: "待审核的付款凭据", readyAccept: "可接单的订单", inProgress: "执行中的订单",
    thisWeek: "本周", orders: "订单", completed: "已完成", orderValue: "订单金额",
    quickActions: "快捷操作", createService: "创建服务", viewOrders: "查看订单", editStorefront: "编辑店铺",
    catalog: "目录", activeServices: "在架服务", products: "商品", plan: "方案", freeBeta: "免费（测试版）",
  },
  orders: {
    title: "订单", subtitle: "审核请求、确认收款并完成订单。",
    all: "全部", review: "付款审核", paid: "已付款", progress: "执行中", completed: "已完成",
    empty: "暂无订单", emptyBody: "此状态的订单会显示在这里。",
  },
  od: {
    back: "订单", nextAction: "下一步操作", noFurther: "无需进一步操作。",
    customerRequest: "客户请求", package: "配套", amount: "金额", place: "地点",
    fulfilment: "履约", provider: "服务商", evidenceRequired: "所需完成记录",
    none: "无", photo: "照片", photoVideo: "照片 + 视频",
    paymentReview: "付款审核", uploadWarn: "上传收据并不代表已确认收款。请先核对银行入账再确认。",
    amountDue: "应付金额", reference: "参考编号", uploaded: "上传时间", method: "方式",
    checkBank: "请在银行应用核对：金额 {amount}，参考编号 {ref}。",
    paymentDetails: "收款资料", payment: "付款", verifiedSummary: "已确认 · {amount} · {date}",
    submitEvidenceTitle: "提交完成记录", requiredLine: "所需：{ev}。添加您的记录后提交。",
    addPhoto: "添加照片", addVideo: "添加视频", completionEvidence: "完成记录",
    progress: "进度", demoNote: "演示：操作仅更新此屏幕（不会保存）。",
    paymentIssue: "付款问题", receiptRejected: "收据已退回。客户可重新上传收据。",
    assignment: "分配", paymentReceipt: "付款收据",
    actions: {
      verify_payment: "确认收款", reject_receipt: "退回收据", accept_order: "接单",
      start_fulfilment: "开始执行", submit_evidence: "提交完成记录", complete_order: "完成订单",
      cant_fulfil: "无法完成此订单", mark_refund_sent: "标记为已退款", upload_proof: "上传付款凭据",
    },
    steps: {
      proofSubmitted: "已提交付款凭据", paymentVerified: "已确认收款", accepted: "已接单",
      fulfilmentStarted: "已开始执行", evidenceSubmitted: "已提交完成记录", completed: "已完成",
    },
    dlg: {
      cantfulfilTitle: "无法完成此订单？",
      cantfulfilBody: "订单将转为“待退款”。您需要直接退还客户 {amount}。愿成不代收、不代转任何款项。",
      keepOrder: "保留订单", yesStartRefund: "确认，开始退款",
      rejectTitle: "退回收据？", rejectBody: "客户将被要求重新上传收据。",
      reason: "原因", cancel: "取消", rejectReceipt: "退回收据",
    },
  },
  services: {
    title: "服务", subtitle: "您的服务列表及其配套。", create: "创建服务",
    empty: "暂无服务", emptyCta: "创建您的第一个服务", published: "已发布", packages: "个配套",
    newTitle: "创建服务", newSub: "填写服务信息。保存后再添加配套。",
    name: "服务名称", description: "描述", guidance: "请求指引（向客户显示）",
    placeField: "地点", evidence: "完成记录", visibility: "客户可见性", auto: "自动", approval: "需审核",
    customerPhoto: "客户照片", off: "关闭", optional: "可选", required: "必填",
    save: "保存服务", cancel: "取消", demoNote: "演示：在接入数据库前，保存功能已停用。",
  },
  products: {
    title: "商品", subtitle: "实体商品。客户联系您购买——不经愿成结账。",
    add: "添加商品", empty: "暂无商品", emptyBody: "添加商品即可在店铺中展示。",
    physical: "实体", contactProvider: "联系服务商",
    newTitle: "添加商品", newSub: "实体商品——在愿成之外销售（联系服务商）。",
    name: "商品名称", description: "描述", priceRM: "价格（RM）", status: "状态",
    published: "已发布", draft: "草稿", save: "保存商品",
    demoNote: "演示：无购物车、结账、付款、运送或库存。接入数据库前保存已停用。",
  },
  customers: {
    title: "客户", subtitle: "曾向您下单的客户。",
    empty: "暂无客户", emptyBody: "首笔订单后，客户会显示在这里。",
    order: "笔订单", orders: "笔订单", last: "最近", orderHistory: "订单记录", notFound: "找不到客户",
  },
  sub: {
    title: "订阅", subtitle: "您的方案与容量。", free: "免费",
    freeDesc: "测试版期间免费 · 平台佣金 0%", active: "生效中",
    overLimit: "您目前已超出方案容量。现有列表仍然有效——请检查目录或提升容量。",
    capacity: "容量", services: "服务", products: "商品", staff: "员工", runner: "跑腿", evidence: "完成记录",
    enabled: "已启用", disabled: "未启用", unlimited: "无限",
    reviewCatalog: "检查目录", increaseCapacity: "提升容量",
    note: "测试版暂未开放付费方案与定价。",
  },
  acct: {
    title: "账户", subtitle: "业务信息、核实，以及客户如何向您付款。",
    businessInfo: "业务信息", businessName: "商号名称", location: "地点",
    verification: "核实", identity: "身份", business: "营业", physicalLocation: "实体地点",
    verified: "已核实", pending: "审核中",
    verificationNote: "已核实服务商。核实仅确认身份与营业信息——不代表任何地点的背书，愿成亦不保证任何结果。",
    paymentMethods: "您的收款资料", addMethod: "添加方式",
    paymentNote: "客户直接向您付款的方式（第一阶段）。这是您自己的账户——并非愿成代付账户。",
    accountName: "账户名称", accountNumber: "账号", duitnow: "DuitNow QR",
    security: "安全", email: "邮箱", password: "密码", change: "修改",
  },
  store: {
    title: "店铺", subtitle: "客户看到的内容。", preview: "预览店铺",
    businessProfile: "业务资料", published: "已发布", businessName: "商号名称", location: "地点",
    about: "简介", services: "服务", products: "商品", manage: "管理",
    fulfilmentInfo: "履约信息",
    fulfilmentBody: "订单由服务商完成。付款直接支付给服务商（第一阶段）。",
  },
  login: {
    title: "服务商入口", subtitle: "管理您的服务、店铺与订单。",
    email: "邮箱", password: "密码", signIn: "登录", signingIn: "登录中…",
    create: "创建服务商账户", back: "返回愿成",
    invalid: "邮箱或密码不正确。", unavailable: "登录暂不可用。",
  },
};

export const PROVIDER_DICT = { en, zh };
export type ProviderDict = typeof en;
export function getProviderDict(lang: ProviderLang): ProviderDict {
  return lang === "zh" ? zh : en;
}
/** Interpolate {token} placeholders. */
export function fill(s: string, vars: Record<string, string>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}
