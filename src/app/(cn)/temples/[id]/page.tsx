import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemple, getPackages } from "@/lib/server-data";
import PhotoCarousel from "@/components/PhotoCarousel";
import PackageCard from "@/components/PackageCard";

export const dynamic = "force-dynamic";

export default async function TempleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const temple = await getTemple(id);

  if (!temple) {
    notFound();
  }

  const packages = await getPackages(temple.id);
  const activePackages = packages.filter((pkg) => pkg.status === "active");
  const isActive = temple.status === "active";

  return (
    <>
      {/* HERO */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--earth-800), var(--amber-900))",
          color: "white",
          padding: "var(--space-8) 0",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              marginBottom: "var(--space-3)",
            }}
          >
            <Link
              href="/temples"
              style={{ color: "rgba(255,255,255,0.6)", fontSize: "var(--text-sm)" }}
            >
              寺庙
            </Link>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
            <span style={{ fontSize: "var(--text-sm)" }}>{temple.name}</span>
          </div>

          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
            {temple.name}
            {temple.verification_status === "verified" && (
              <span
                className="badge badge-brown"
                style={{ fontSize: "var(--text-sm)", marginLeft: "var(--space-2)", verticalAlign: "middle" }}
              >
                ✓ 已认证
              </span>
            )}
          </h1>

          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "var(--space-2)" }}>
            📍 {temple.city}, {temple.country}
            {temple.address && <> · {temple.address}</>}
          </p>

          {temple.short_description_zh && (
            <p
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "var(--text-base)",
                lineHeight: 1.7,
                maxWidth: 640,
                marginTop: "var(--space-3)",
              }}
            >
              {temple.short_description_zh}
            </p>
          )}

          {temple.prayer_tags_zh && temple.prayer_tags_zh.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
              {temple.prayer_tags_zh.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "var(--text-sm)",
                    padding: "4px 12px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 图片轮播 */}
      {temple.photos && temple.photos.length > 0 && (
        <section style={{ paddingTop: "var(--space-5)" }}>
          <div className="container">
            <PhotoCarousel photos={temple.photos} alt={temple.name} height={360} />
          </div>
        </section>
      )}

      {/* 配套选择 */}
      <section className="section" style={{ paddingTop: "var(--space-6)" }}>
        <div className="container">
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              marginBottom: "var(--space-1)",
            }}
          >
            选择配套
          </h2>
          <p
            className="text-sm text-muted"
            style={{ marginBottom: "var(--space-5)" }}
          >
            所有配套均包含照片凭证。部分配套包含视频记录。
          </p>

          {activePackages.length === 0 ? (
            <div className="card text-center" style={{ padding: "var(--space-8)" }}>
              <div style={{ fontSize: 32, marginBottom: "var(--space-3)" }}>📭</div>
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>暂无配套</h3>
              <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
                此寺庙的配套正在准备中，请稍后再来。
              </p>
              <Link href="/temples" className="btn btn-secondary">← 返回寺庙</Link>
            </div>
          ) : (
            <div className="grid grid-3">
              {activePackages.map((pkg, index) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  templeId={temple.id}
                  isPopular={index === 1}
                  href={`/checkout?temple=${temple.id}&package=${pkg.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 信任证明 */}
      <section style={{ padding: "var(--space-8) 0", background: "var(--stone-50)" }}>
        <div className="container">
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "var(--space-6)",
            }}
          >
            您将收到什么
          </h2>

          <div className="grid grid-3" style={{ gap: "var(--space-4)" }}>
            <div className="card text-center" style={{ padding: "var(--space-5)" }}>
              <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>📸</div>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>照片凭证</h4>
              <p className="text-sm text-muted">
                在寺庙拍摄的清晰照片，展示所有供品及仪式过程。
              </p>
            </div>

            <div className="card text-center" style={{ padding: "var(--space-5)" }}>
              <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>🎥</div>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>视频记录</h4>
              <p className="text-sm text-muted">
                祈愿仪式的视频记录（虔诚配套及以上包含）。
              </p>
            </div>

            <div className="card text-center" style={{ padding: "var(--space-5)" }}>
              <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>📋</div>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>收据验证</h4>
              <p className="text-sm text-muted">
                寺庙出具的所有供品及捐款的实际收据。
              </p>
            </div>
          </div>

          {/* 流程说明 */}
          <div className="card" style={{ marginTop: "var(--space-6)", padding: "var(--space-5)" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)", textAlign: "center" }}>
              服务流程
            </h3>
            <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", minWidth: 120 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--amber-600)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    margin: "0 auto var(--space-2)",
                  }}
                >
                  1
                </div>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>下单</div>
                <div className="text-xs text-muted">选择配套并付款</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", color: "var(--stone-300)", fontSize: 20 }}>→</div>
              <div style={{ textAlign: "center", minWidth: 120 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--amber-600)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    margin: "0 auto var(--space-2)",
                  }}
                >
                  2
                </div>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>执行人前往</div>
                <div className="text-xs text-muted">当天在寺庙完成仪式</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", color: "var(--stone-300)", fontSize: 20 }}>→</div>
              <div style={{ textAlign: "center", minWidth: 120 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--amber-600)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    margin: "0 auto var(--space-2)",
                  }}
                >
                  3
                </div>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>发送凭证</div>
                <div className="text-xs text-muted">照片、视频、收据</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 常见问题 */}
      <section className="section">
        <div className="container">
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "var(--space-6)",
            }}
          >
            常见问题
          </h2>

          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>
                如何确认仪式真的进行了？
              </h4>
              <p className="text-sm text-muted">
                每份订单都包含在寺庙拍摄的清晰照片。高级配套还包含视频记录。
                您还会收到寺庙出具的所有供品的实际收据。
              </p>
            </div>

            <div className="card" style={{ padding: "var(--space-4)" }}>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>
                可以附上个人祈愿或特定心愿吗？
              </h4>
              <p className="text-sm text-muted">
                可以。在结账时，您可以添加特殊说明，写下您的个人祈愿或心愿。
                我们的执行人会在仪式中代为诵读。
              </p>
            </div>

            <div className="card" style={{ padding: "var(--space-4)" }}>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>
                如果以后需要还愿怎么办？
              </h4>
              <p className="text-sm text-muted">
                您可以随时再次下单。许多客户会回来还愿。
                您的订单历史记录会保存在您的账户中。
              </p>
            </div>

            <div className="card" style={{ padding: "var(--space-4)" }}>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>
                需要多长时间？
              </h4>
              <p className="text-sm text-muted">
                大多数订单在24小时内完成。凭证会通过电子邮件发送给您，
                也可以在您的账户中查看。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      {activePackages.length > 0 && (
        <section style={{ padding: "var(--space-6) 0", background: "var(--stone-50)" }}>
          <div className="container text-center">
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
              准备好了吗？
            </h2>
            <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
              选择上方配套即可开始。
            </p>
            <Link href={`/checkout?temple=${temple.id}`} className="btn btn-primary btn-lg">
              立即下单
            </Link>
          </div>
        </section>
      )}

      <div style={{ height: "var(--space-6)" }} />
    </>
  );
}
