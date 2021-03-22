import _rawCountries from "./rawCountries";
import _rawTerritories from "./rawTerritories";
import {
	Region,
	Country,
	Priorities,
	AreaCodes,
	Masks,
	PartialCountries,
	Localization,
	PreserveOrder,
} from "./typings";
import { buildCustomSettings, extendRawCountries, initCountries } from "./utils";
export default class CountryData {
	onlyCountries: Country[];
	preferredCountries: Country[];
	hiddenAreaCodes: Country[];

	constructor(
		enableAreaCodes: boolean | PartialCountries,
		enableTerritories: boolean,
		regions: Region | Region[] | null,
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
					preserveOrder?.includes("onlyCountries"),
				),
				excludeCountries,
			),
			localization,
			preserveOrder?.includes("onlyCountries"),
		);

		this.preferredCountries =
			preferredCountries.length === 0
				? []
				: this.localizeCountries(
						this.getFilteredCountryList(
							preferredCountries,
							initializedCountries,
							preserveOrder?.includes("preferredCountries"),
						),
						localization,
						preserveOrder?.includes("preferredCountries"),
				  );

		// apply filters to hiddenAreaCodes
		this.hiddenAreaCodes = this.excludeCountries(
			this.getFilteredCountryList(onlyCountries, hiddenAreaCodes),
			excludeCountries,
		);
	}

	filterRegions = (regions: Region | Region[] | null, countries: Country[]) => {
		if (!regions) return countries;

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
