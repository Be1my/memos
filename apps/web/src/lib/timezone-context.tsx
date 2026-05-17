import { createContext, useContext } from "react";

interface TimezoneContextValue {
	timeZone: string;
}

const TimezoneContext = createContext<TimezoneContextValue>({ timeZone: "UTC" });

export function TimezoneProvider({
	timeZone,
	children,
}: {
	timeZone: string;
	children: React.ReactNode;
}) {
	return (
		<TimezoneContext.Provider value={{ timeZone }}>
			{children}
		</TimezoneContext.Provider>
	);
}

export function useTimezone() {
	return useContext(TimezoneContext);
}
