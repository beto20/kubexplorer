export function hasWailsRuntime(): boolean {
	if (typeof window === 'undefined') {
		return false
	}
	const w = window as unknown as { go?: { binding?: unknown } }
	return Boolean(w.go?.binding)
}
