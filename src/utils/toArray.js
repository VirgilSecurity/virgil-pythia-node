/**
 * Converts the `arg` to an array. If `arg` is already an array, it is returned as is.
 *
 * @hidden
 *
 * @param arg - Value to convert
 * @returns {[]}
 */
export function toArray(arg) {
	return arg == null
		? []
		: Array.isArray(arg) ? arg : [ arg ];
}
