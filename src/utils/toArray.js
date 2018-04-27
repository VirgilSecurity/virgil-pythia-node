export function toArray(arg) {
	return arg == null
		? arg
		: Array.isArray(arg) ? arg : [ arg ];
}
