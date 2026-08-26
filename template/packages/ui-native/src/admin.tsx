import { designTokens } from "@starter/design-system";
import type {
  AdminShellPrimitiveProps,
  AnalyticsDashboardPrimitiveProps,
  ResourceListPrimitiveProps,
  StatusTone,
} from "@starter/ui-engine";
import { type Href, Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SELECTED_STATE = { selected: true } as const;
const DEFAULT_STATE = { selected: false } as const;

export function NativeAdminShell({
  active,
  children,
  navigation,
}: AdminShellPrimitiveProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark} />
        <Text style={styles.brand}>REFINEFOODS</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JS</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.navigation}
      >
        {navigation.map((item) => {
          const isCurrent = item.id === active;
          return (
            <Link asChild href={item.path as Href} key={item.id}>
              <Pressable
                accessibilityRole="link"
                accessibilityState={isCurrent ? SELECTED_STATE : DEFAULT_STATE}
                style={isCurrent ? styles.currentLink : styles.link}
              >
                <Text style={isCurrent ? styles.currentLinkText : styles.linkText}>
                  {item.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

export function NativeAnalyticsDashboard({
  metrics,
  orders,
  period,
  timeline,
  trending,
}: AnalyticsDashboardPrimitiveProps) {
  return (
    <View>
      <View style={styles.pageHeader}>
        <Text accessibilityRole="header" style={styles.pageTitle}>
          Overview
        </Text>
        <Text style={styles.period}>{period}</Text>
      </View>
      {metrics.map((metric) => (
        <View key={metric.id} style={styles.card}>
          <View style={styles.metricHeader}>
            <Text>{metric.label}</Text>
            <Text style={styles.metricValue}>{metric.value}</Text>
          </View>
          <Text
            accessibilityLabel={`${metric.label} weekly chart`}
            style={styles.sparkline}
          >
            {toSparkline(metric.values)}
          </Text>
          <Text style={styles.trend}>{metric.trend}</Text>
        </View>
      ))}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Timeline</Text>
        {timeline.map((item) => (
          <View key={item.id} style={styles.timelineRow}>
            <NativeStatus tone={item.tone} value={item.status} />
            <Text style={styles.rowId}>{item.id}</Text>
            <Text style={styles.muted}>{item.age}</Text>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Orders</Text>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderRow}>
            <View>
              <Text style={styles.rowId}>
                {order.id} · {order.customer}
              </Text>
              <Text numberOfLines={1} style={styles.muted}>
                {order.address}
              </Text>
            </View>
            <Text style={styles.metricValue}>{order.amount}</Text>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trending Products</Text>
        {trending.map((product, index) => (
          <View key={product.id} style={styles.orderRow}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={styles.grow}>
              <Text style={styles.rowId}>{product.name}</Text>
              <Text style={styles.muted}>Ordered {product.orders} times</Text>
            </View>
            <Text>{product.price}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function NativeResourceList({
  columns,
  primaryAction,
  rows,
  title,
}: ResourceListPrimitiveProps) {
  return (
    <View>
      <View style={styles.pageHeader}>
        <Text accessibilityRole="header" style={styles.pageTitle}>
          {title}
        </Text>
        {primaryAction ? (
          <Pressable accessibilityRole="button" style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>＋ {primaryAction}</Text>
          </Pressable>
        ) : null}
      </View>
      {rows.map((row) => (
        <View key={row.id} style={styles.card}>
          {columns.map((column) => {
            const cell = row.cells[column.id];
            return (
              <View key={column.id} style={styles.resourceRow}>
                <Text style={styles.muted}>{column.label}</Text>
                {cell?.tone ? (
                  <NativeStatus tone={cell.tone} value={cell.value} />
                ) : (
                  <View style={styles.alignEnd}>
                    <Text style={styles.rowId}>{cell?.value ?? "—"}</Text>
                    {cell?.secondary ? (
                      <Text style={styles.muted}>{cell.secondary}</Text>
                    ) : null}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function NativeStatus({ tone, value }: Readonly<{ tone: StatusTone; value: string }>) {
  return (
    <View style={statusStyle(tone)}>
      <Text style={statusTextStyle(tone)}>{value}</Text>
    </View>
  );
}

function statusStyle(tone: StatusTone) {
  if (tone === "danger") return styles.statusDanger;
  if (tone === "success") return styles.statusSuccess;
  if (tone === "warning") return styles.statusWarning;
  return styles.statusInfo;
}

function statusTextStyle(tone: StatusTone) {
  if (tone === "danger") return styles.statusDangerText;
  if (tone === "success") return styles.statusSuccessText;
  if (tone === "warning") return styles.statusWarningText;
  return styles.statusInfoText;
}

function toSparkline(values: readonly number[]): string {
  const blocks = "▁▂▃▄▅▆▇█";
  const max = Math.max(...values);
  return values.map((value) => blocks[Math.round((value / max) * 7)]).join(" ");
}

const baseStatus = {
  alignItems: "center" as const,
  borderRadius: 4,
  borderWidth: 1,
  minHeight: 28,
  paddingHorizontal: 8,
  justifyContent: "center" as const,
};

const styles = StyleSheet.create({
  alignEnd: { alignItems: "flex-end", flex: 1 },
  avatar: {
    alignItems: "center",
    backgroundColor: "#e8c8a6",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    marginLeft: "auto",
    width: 36,
  },
  avatarText: { color: "#5b321f", fontSize: 11, fontWeight: "800" },
  brand: { color: designTokens.color.ink, fontSize: 13, fontWeight: "800" },
  brandMark: {
    backgroundColor: designTokens.color.accent,
    borderRadius: 8,
    height: 24,
    width: 24,
  },
  brandRow: {
    alignItems: "center",
    backgroundColor: designTokens.color.surface,
    borderBottomColor: designTokens.color.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: designTokens.color.surface,
    borderColor: designTokens.color.border,
    borderRadius: designTokens.radius.card,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  cardTitle: {
    color: designTokens.color.ink,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  content: { padding: 16, paddingBottom: 48 },
  currentLink: {
    backgroundColor: "#fff1eb",
    borderRadius: 7,
    justifyContent: "center",
    marginRight: 6,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  currentLinkText: { color: designTokens.color.accent, fontWeight: "700" },
  grow: { flex: 1 },
  link: {
    justifyContent: "center",
    marginRight: 6,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  linkText: { color: designTokens.color.ink },
  metricHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricValue: { color: designTokens.color.ink, fontWeight: "800" },
  muted: { color: designTokens.color.muted, fontSize: 12 },
  navigation: {
    backgroundColor: designTokens.color.surface,
    flexGrow: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  orderRow: {
    alignItems: "center",
    borderTopColor: designTokens.color.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
  },
  pageHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    minHeight: 48,
  },
  pageTitle: { color: designTokens.color.ink, fontSize: 23, fontWeight: "800" },
  period: {
    borderColor: designTokens.color.border,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primaryButton: {
    backgroundColor: designTokens.color.accent,
    borderRadius: 6,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 12,
  },
  primaryButtonText: { color: designTokens.color.accentContrast, fontWeight: "700" },
  rank: {
    color: designTokens.color.accent,
    fontSize: 18,
    fontWeight: "800",
    width: 24,
  },
  resourceRow: {
    alignItems: "center",
    borderTopColor: designTokens.color.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 54,
  },
  rowId: { color: designTokens.color.ink, fontWeight: "700" },
  safeArea: { backgroundColor: designTokens.color.canvas, flex: 1 },
  sparkline: { color: "#4389ee", fontSize: 40, letterSpacing: 2, marginTop: 16 },
  statusDanger: { ...baseStatus, backgroundColor: "#fff1f1", borderColor: "#efb2b2" },
  statusDangerText: { color: "#bd3838", fontSize: 12 },
  statusInfo: { ...baseStatus, backgroundColor: "#edf7ff", borderColor: "#9bc8ef" },
  statusInfoText: { color: "#246da9", fontSize: 12 },
  statusSuccess: { ...baseStatus, backgroundColor: "#f3ffe9", borderColor: "#b7df9c" },
  statusSuccessText: { color: "#4e9227", fontSize: 12 },
  statusWarning: { ...baseStatus, backgroundColor: "#fff9e8", borderColor: "#efd49a" },
  statusWarningText: { color: "#a56e13", fontSize: 12 },
  timelineRow: {
    alignItems: "center",
    borderTopColor: designTokens.color.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 52,
  },
  trend: { color: "#4e9227", fontSize: 12 },
});
