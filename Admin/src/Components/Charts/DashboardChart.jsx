import styles from "./DashboardChart.module.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { useDashboardLogic } from "../../UI_Logic/DashboardLogic";
import { authFetch } from "../../pages/Login/auth.js";

export default function RevenueChart() {
  const { categories } = useDashboardLogic(authFetch);

  const chartData = (categories ?? []).map((item) => ({
    category: item[0],
    quantity: Number(item[1]) || 0,
  }));

  return (
    <div className={styles.dashboardChart}>
      <h3 className={styles.chartTitle}>
        Products by Category
      </h3>

      <p className={styles.chartDescription}>
        Quantity for each category
      </p>

      <div className={styles.chartContainer}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 16,
                right: 12,
                left: 4,
                bottom: 4,
              }}
              barCategoryGap="20%"
            >
              <CartesianGrid
                stroke="var(--color-line)"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="category"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--color-muted)",
                  fontSize: 12,
                }}
                tickMargin={12}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--color-muted)",
                  fontSize: 12,
                }}
                width={40}
                allowDecimals={false}
                domain={[0, "auto"]}
              />

              <Tooltip
                cursor={false}
                formatter={(value) => [
                  `${Number(value).toLocaleString()}`,
                  "Quantity",
                ]}
                labelFormatter={(label) => `Category: ${label}`}
                contentStyle={{
                  background: "var(--color-paper)",
                  border: "1px solid var(--color-line)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-ink)",
                  boxShadow: "var(--shadow-card)",
                }}
              />

              <Bar
                dataKey="quantity"
                fill="var(--color-accent)"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                activeBar={false}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className={styles.chartDescription}>
            No category data available.
          </p>
        )}
      </div>
    </div>
  );
}