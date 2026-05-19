import { create } from "zustand";

interface ClockStore {
	tick: number;
}

const useClockStore = create<ClockStore>(() => ({ tick: 0 }));

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startClock() {
	if (intervalId) return;
	intervalId = setInterval(() => {
		useClockStore.setState({ tick: Date.now() });
	}, 60_000);
}

export function stopClock() {
	if (intervalId) {
		clearInterval(intervalId);
		intervalId = null;
	}
}

export { useClockStore };
