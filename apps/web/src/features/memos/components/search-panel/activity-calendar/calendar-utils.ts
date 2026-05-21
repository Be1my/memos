export const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export const MONTHS = [
	"1月",
	"2月",
	"3月",
	"4月",
	"5月",
	"6月",
	"7月",
	"8月",
	"9月",
	"10月",
	"11月",
	"12月",
];

export function getHeatColor(count: number, max: number): string {
	if (count === 0) return "bg-primary/[0.04]";
	const intensity = Math.min(Math.ceil((count / max) * 5), 5);
	const colors = [
		"",
		"bg-primary/10",
		"bg-primary/25",
		"bg-primary/40",
		"bg-primary/60",
		"bg-primary/80",
	];
	return colors[intensity] ?? colors[5];
}
