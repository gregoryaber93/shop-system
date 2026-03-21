import "@testing-library/jest-dom/vitest";

import { queryClient } from "@/shared/lib/query/queryClient";

afterEach(() => {
	localStorage.clear();
	queryClient.clear();
});
