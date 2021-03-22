import {
	RawCountry,
	Country,
	AreaItem,
	Priorities,
	AreaCodes,
	Masks,
	PartialCountries,
	CustomSettings,
	Iso2Code,
} from "../typings";

/**
 * Generates the phone mask for the defined dialCode, taking into account the default & predefined masks
 * @param prefix prefix of the phone number (ie: `+`)
 * @param dialCode dial code of the country
 * @param predefinedMask predefined mask that should be applied
 * @param defaultMask default mask that should be applied if no predefinedMask supplied
 * @param alwaysDefaultMask overrides predefinedMask and always use defaultMask
 * @returns phone mask for the defined dialCode
 */
export const getMask = (
	prefix: string,
	dialCode: string,
	predefinedMask?: string,
	defaultMask?: string,
	alwaysDefaultMask?: boolean,
) => {
	if (!predefinedMask || alwaysDefaultMask) {
		return prefix + "".padEnd(dialCode.length, ".") + " " + defaultMask;
	}

	return prefix + "".padEnd(dialCode.length, ".") + " " + predefinedMask;
};

/**
 * Builds list of country objects
 * @param countries raw countries array
 * @param enableAreaCodes enables local codes for all countries (boolean) or for specific countries (array of Iso2 country codes)
 * @param prefix prefix of the phone number (ie: `+`)
 * @param defaultMask default mask that should be applied
 * @param alwaysDefaultMask overrides predefinedMask and always use defaultMask
 * @returns initialized countries with or without area codes
 */
export const initCountries = (
	countries: RawCountry[],
	enableAreaCodes: boolean | PartialCountries,
	prefix: string,
	defaultMask: string,
	alwaysDefaultMask: boolean,
) => {
	let hiddenAreaCodes: AreaItem[] = [];

	// enable all codes when `enableAreaCode={true}` but not when a iso2 array is provided
	const enableAllCodes = enableAreaCodes === true;

	const initializedCountries = ([] as Country[]).concat(
		...countries.map((country) => {
			const countryItem: Country = {
				name: country[0],
				localName: country[0], // English by default, will be localized at a later stage
				regions: country[1],
				iso2: country[2],
				countryCode: country[3],
				dialCode: country[3],
				format: getMask(prefix, country[3], country[4], defaultMask, alwaysDefaultMask),
				priority: country[5] || 0,
			};

			const areaItems: AreaItem[] = country[6]
				? country[6].map((areaCode) => ({
						...countryItem,
						dialCode: country[3] + areaCode,
						isAreaCode: true,
						areaCodeLength: areaCode.length,
				  }))
				: [];

			if (areaItems.length) {
				countryItem.mainCode = true;
				if (
					enableAllCodes ||
					(enableAreaCodes.constructor.name === "Array" &&
						(enableAreaCodes as PartialCountries).includes(country[2]))
				) {
					countryItem.hasAreaCodes = true;
					return [countryItem, ...areaItems];
				}

				hiddenAreaCodes = hiddenAreaCodes.concat(areaItems);
				return [countryItem];
			}

			return [countryItem];
		}),
	);

	return [initializedCountries, hiddenAreaCodes];
};

/**
 * Build custom settings array based on user-specified settings like masks, area codes and priorities
 * @param customSettings object containing custom `masks`, `areaCodes` and `priorities`
 * @returns custom settings array or country settings, with keys in order: [[Iso2Code, Mask, AreaCodes, Priority]]
 * Example:
 *
 * input:
 * 	{
 *		masks: {
 *			fr: "(...) ..-..-..",
 *			at: "(....) ...-....",
 *		},
 *		areaCodes: {
 *			gr: ["2694", "2647"],
 *			fr: ["369", "463"],
 *			us: ["300"],
 *		},
 *		priorities: {
 *			fr: 1,
 *			ca: 0,
 *			us: 1,
 *			kz: 0,
 *			ru: 1,
 *		},
 *  }
 * output:
 * [
 *   [ 'fr', '(...) ..-..-..', [ '369', '463' ] ],
 *   [ 'at', '(....) ...-....' ],
 *   [ 'gr', , [ '2694', '2647' ] ],
 *   [ 'us', , [ '300' ], 1 ],
 *   [ 'ca', , , 0 ],
 *   [ 'kz', , , 0 ],
 *   [ 'ru', , , 1 ]
 * ]
 */
export const buildCustomSettings = (
	masks: Masks,
	areaCodes: AreaCodes,
	priorities: Priorities,
): CustomSettings[] => {
	const allCountries = [
		...new Set([
			...Object.keys(masks || {}),
			...Object.keys(areaCodes || {}),
			...Object.keys(priorities || {}),
		] as PartialCountries),
	];
	return allCountries.map((country) => [
		country,
		masks[country as Iso2Code],
		areaCodes[country as Iso2Code],
		priorities[country as Iso2Code],
	]) as CustomSettings[];
};

/**
 * Extends raw countries with custom settings (custom masks, area codes and priorities)
 * @param countries raw countries
 * @param userSettings custom user settings
 * @returns extended raw countries
 */
export const extendRawCountries = (countries: RawCountry[], userSettings: CustomSettings[]) => {
	if (userSettings.length === 0) return countries;

	// userSettings index -> rawCountries index of country array to extend
	// [iso2 (0 -> 2), mask (1 -> 4), priority (3 -> 5), areaCodes (2 -> 6)]

	return countries.map((rawCountry) => {
		const userContentIndex = userSettings.findIndex((arr) => arr[0] === rawCountry[2]); // find by iso2
		if (userContentIndex === -1) return rawCountry; // if iso2 not in userSettings, return source country object
		const userContentCountry = userSettings[userContentIndex];
		if (userContentCountry[1]) rawCountry[4] = userContentCountry[1]; // mask
		if (userContentCountry[3]) rawCountry[5] = userContentCountry[3]; // priority
		if (userContentCountry[2]) rawCountry[6] = userContentCountry[2]; // areaCodes
		return rawCountry;
	});
};
