import _rawCountries from "./rawCountries";
import _rawTerritories from "./rawTerritories";
import {
	RawCountry,
	Region,
	Country,
	AreaItem,
	Priorities,
	AreaCodes,
	Masks,
	PartialCountries,
	Localization,
	PreserveOrder,
	CustomSettings,
	Iso2Code,
} from "./typings";

/**
 * Generates the phone mask for the defined dialCode, taking into account the default & predefined masks
 * @param prefix prefix of the phone number (ie: `+`)
 * @param dialCode dial code of the country
 * @param predefinedMask predefined mask that should be applied
 * @param defaultMask default mask that should be applied if no predefinedMask supplied
 * @param alwaysDefaultMask overrides predefinedMask and always use defaultMask
 * @returns phone mask for the defined dialCode
 */
function getMask(
	prefix: string,
	dialCode: string,
	predefinedMask?: string,
	defaultMask?: string,
	alwaysDefaultMask?: boolean,
) {
	if (!predefinedMask || alwaysDefaultMask) {
		return prefix + "".padEnd(dialCode.length, ".") + " " + defaultMask;
	}

	return prefix + "".padEnd(dialCode.length, ".") + " " + predefinedMask;
}

/**
 * Builds list of country objects
 * @param countries raw countries array
 * @param enableAreaCodes enables local codes for all countries (boolean) or for specific countries (array of Iso2 country codes)
 * @param prefix prefix of the phone number (ie: `+`)
 * @param defaultMask default mask that should be applied
 * @param alwaysDefaultMask overrides predefinedMask and always use defaultMask
 * @returns initialized countries with or without area codes
 */
function initCountries(
	countries: RawCountry[],
	enableAreaCodes: boolean | PartialCountries,
	prefix: string,
	defaultMask: string,
	alwaysDefaultMask: boolean,
) {
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
}

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
function buildCustomSettings(
	masks: Masks,
	areaCodes: AreaCodes,
	priorities: Priorities,
): CustomSettings[] {
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
}

/**
 * Extends raw countries with custom settings (custom masks, area codes and priorities)
 * @param countries raw countries
 * @param userSettings custom user settings
 * @returns extended raw countries
 */
function extendRawCountries(countries: RawCountry[], userSettings: CustomSettings[]) {
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
}

export default class CountryData {
	onlyCountries: Country[];
	preferredCountries: Country[];
	hiddenAreaCodes: Country[];

	constructor(
		enableAreaCodes: boolean | PartialCountries,
		enableTerritories: boolean,
		regions: Region[],
		onlyCountries: PartialCountries,
		preferredCountries: PartialCountries,
		excludeCountries: PartialCountries,
		preserveOrder: PreserveOrder,
		masks: Masks,
		priorities: Priorities,
		areaCodes: AreaCodes,
		localization: Localization,
		prefix: string,
		defaultMask: string,
		alwaysDefaultMask: boolean,
	) {
		const userSettings = buildCustomSettings(masks, areaCodes, priorities);
		const rawCountries = extendRawCountries(
			JSON.parse(JSON.stringify(_rawCountries)),
			userSettings,
		);
		const rawTerritories = extendRawCountries(
			JSON.parse(JSON.stringify(_rawTerritories)),
			userSettings,
		);

		const result = initCountries(
			rawCountries,
			enableAreaCodes,
			prefix,
			defaultMask,
			alwaysDefaultMask,
		);
		let [initializedCountries] = result;
		const [, hiddenAreaCodes] = result;

		if (enableTerritories) {
			const [initializedTerritories] = initCountries(
				rawTerritories,
				enableAreaCodes,
				prefix,
				defaultMask,
				alwaysDefaultMask,
			);
			initializedCountries = this.sortTerritories(
				initializedTerritories,
				initializedCountries,
			);
		}
		if (regions) {
			initializedCountries = this.filterRegions(regions, initializedCountries);
		}

		this.onlyCountries = this.localizeCountries(
			this.excludeCountries(
				this.getFilteredCountryList(
					onlyCountries,
					initializedCountries,
					preserveOrder.includes("onlyCountries"),
				),
				excludeCountries,
			),
			localization,
			preserveOrder.includes("onlyCountries"),
		);

		this.preferredCountries =
			preferredCountries.length === 0
				? []
				: this.localizeCountries(
						this.getFilteredCountryList(
							preferredCountries,
							initializedCountries,
							preserveOrder.includes("preferredCountries"),
						),
						localization,
						preserveOrder.includes("preferredCountries"),
				  );

		// apply filters to hiddenAreaCodes
		this.hiddenAreaCodes = this.excludeCountries(
			this.getFilteredCountryList(onlyCountries, hiddenAreaCodes),
			excludeCountries,
		);
	}

	filterRegions = (regions: Region | Region[], countries: Country[]) => {
		// Example: `regions={"europe"}`
		if (typeof regions === "string") {
			const region = regions;
			return countries.filter((country) =>
				country.regions.some((element) => element === region),
			);
		}

		// Example `regions={["europe", "north-america"]}
		return countries.filter((country) => {
			const matches = regions.map((region) => {
				return country.regions.some((element) => {
					return element === region;
				});
			});
			return matches.some((el) => el);
		});
	};

	/**
	 * Sorts territories & countries alphabetically
	 * @param initializedTerritories
	 * @param initializedCountries
	 * @returns alphabetically sorted territories & countries
	 */
	sortTerritories = (
		initializedTerritories: Country[],
		initializedCountries: Country[],
	): Country[] => {
		const fullCountryList = [...initializedTerritories, ...initializedCountries];
		fullCountryList.sort((a, b) => {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		});
		return fullCountryList;
	};

	/**
	 * Filters the country list alphabetically or following a user-defined order
	 * @param countryCodes list of partial Iso2 country codes (ie: `onlyCountries` or `preferredCountries`)
	 * @param sourceCountryList list of initialized country list
	 * @param preserveOrder whether or not to preserve the user-defined order
	 * @returns user-defined or alphabetically ordered country list
	 */
	getFilteredCountryList = (
		countryCodes: PartialCountries,
		sourceCountryList: Country[],
		preserveOrder = false,
	): Country[] => {
		if (countryCodes.length === 0) return sourceCountryList;

		let filteredCountries: Country[] = [];
		if (preserveOrder) {
			// filter using iso2 user-defined order
			filteredCountries = countryCodes
				.map((countryCode) =>
					sourceCountryList.find((country) => country.iso2 === countryCode),
				)
				.filter((country) => country) as Country[]; // remove any not found
		} else {
			// filter using alphabetical order
			filteredCountries = sourceCountryList.filter((country) =>
				countryCodes.some((element) => element === country.iso2),
			);
		}

		return filteredCountries;
	};

	/**
	 * Localizes country names with the option to preserver the original order
	 * @param countries initialized countries list to be localized
	 * @param localization localization/language
	 * @param preserveOrder preserve order of the originally sorted country list (english)
	 * @returns localized countries list
	 */
	localizeCountries = (
		countries: Country[],
		localization: Localization,
		preserveOrder = false,
	): Country[] => {
		for (let i = 0; i < countries.length; i++) {
			if (localization[countries[i].iso2] !== undefined) {
				countries[i].localName = localization[countries[i].iso2];
			} else if (localization[countries[i].name] !== undefined) {
				countries[i].localName = localization[countries[i].name];
			}
		}
		if (!preserveOrder) {
			countries.sort(function (a, b) {
				if (a.localName < b.localName) {
					return -1;
				}
				if (a.localName > b.localName) {
					return 1;
				}
				return 0;
			});
		}
		return countries;
	};

	/**
	 * Excludes countries from the complete list of countries.
	 * @param onlyCountries countries to be included
	 * @param excludedCountries Iso2 country codes to be excluded
	 * @returns list of countries
	 */
	excludeCountries = (
		onlyCountries: Country[],
		excludedCountries: PartialCountries,
	): Country[] => {
		if (excludedCountries.length === 0) {
			return onlyCountries;
		}

		return onlyCountries.filter((country) => !excludedCountries.includes(country.iso2));
	};
}
