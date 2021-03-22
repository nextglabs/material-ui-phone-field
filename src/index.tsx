import React from "react";
import memoize from "lodash/memoize";
import startsWith from "lodash/startsWith";
import { TextField, TextFieldProps } from "@material-ui/core";
import { InputAdornment } from "./components/InputAdornment";
import CountryData from "./CountryData";
import {
	AreaCodes,
	AreaItem,
	Country,
	Iso2Code,
	Localization,
	Masks,
	PartialCountries,
	PreserveOrder,
	Priorities,
	Region,
} from "./typings";
import { formatNumber } from "./utils";
import "./styles/default.scss";

export type PhoneFieldProps = TextFieldProps & {
	/** Specifies custom area codes for country codes, example: `areaCodes={{gr: ['2694', '2647'], fr: ['369', '463'], us: ['300']}}` */
	areaCodes?: AreaCodes;
	/**
	 * Allows to always use default mask
	 * @default false
	 */
	alwaysDefaultMask?: boolean;
	/**
	 * Enables local codes for all countries or for specified Iso2 country codes
	 * ie: `enableAreaCodes={true}` or `enableAreaCodes={['us', 'ca']}`
	 * @default false
	 */
	enableAreaCodes?: boolean | PartialCountries;
	/**
	 * If `enableAreaCodeStretch` is added, the part of the mask with the area code will not stretch to length of the respective section of phone mask.
	 * Example: `+61 (2), +61 (02)`
	 * @default false
	 */
	enableAreaCodeStretch?: boolean;
	/**
	 * Allow phone numbers with more than 15 digits
	 * @default false
	 */
	enableLongNumbers?: boolean;
	/**
	 * Enables dependent territories with population of ~100,000 or lower
	 * @default false
	 */
	enableTerritories?: boolean;
	/**
	 * Auto-formats phone numbers
	 * @default true
	 */
	autoFormat?: boolean;
	/**
	 * Specifies the default country
	 * @default "us"
	 */
	defaultCountry?: Iso2Code;
	/**
	 * Default mask to be used when no other masks are defined in rawCountries/rawTerritories
	 * or when no other masks defined by the user using the `masks` prop
	 * @default "... ... ... ... .."
	 */
	defaultMask?: string;
	/**
	 * Disables country code
	 * @default false
	 */
	disableCountryCode?: boolean;
	/**
	 * Disables initial country guess
	 * @default false
	 */
	disableInitialCountryGuess?: boolean;
	/**
	 * Used to display countries only from specified regions
	 * @default null
	 */
	regions?: Region | Region[] | null;
	/** Country codes to be included, ie: `onlyCountries={['cu','cw','kz']}` */
	onlyCountries?: PartialCountries;
	/** Country codes to be at the top of the dropdown list `preferredCountries={['cu','cw','kz']}` */
	preferredCountries?: PartialCountries;
	/** Country codes to be excluded from the dropdown list `excludeCountries={['cu','cw','kz']}` */
	excludeCountries?: PartialCountries;
	/** Specifies user-defined order */
	preserveOrder?: PreserveOrder;
	/** Specifies custom masks for country codes, example: `masks={{fr: '(...) ..-..-..', at: '(....) ...-....'}}` */
	masks?: Masks;
	/** Specifies custom priority for country codes, example: `priority={{ca: 0, us: 1, kz: 0, ru: 1}}` */
	priority?: Priorities;
	/** Specifies predefined or custom localization */
	localization?: Localization;
	/**
	 * Specifies the country code prefix
	 * @default "+"
	 */
	prefix?: string;
};

export const PhoneField = (props: PhoneFieldProps) => {
	const {
		// MuiPhoneField Props
		areaCodes = {},
		alwaysDefaultMask = false,
		autoFormat = true,
		defaultCountry = "us",
		defaultMask = "... ... ... ... ..",
		disableCountryCode = false,
		disableInitialCountryGuess = false,
		enableAreaCodes = false,
		enableAreaCodeStretch = false,
		enableLongNumbers = false,
		enableTerritories = false,
		excludeCountries = [],
		regions = null,
		localization = {},
		masks = {},
		onlyCountries: onlyCountriesProp = [],
		preferredCountries: preferredCountriesProp = [],
		prefix = "+",
		preserveOrder = null,
		priority = {},
		// MaterialUI TextFieldProps
		placeholder = "1 (702) 123-4567",
		InputProps = {},
		value,
		// Other Props
		...restProps
	} = props;

	const { onlyCountries, preferredCountries, hiddenAreaCodes } = new CountryData(
		enableAreaCodes,
		enableTerritories,
		regions,
		onlyCountriesProp,
		preferredCountriesProp,
		excludeCountries,
		preserveOrder,
		masks,
		priority,
		areaCodes,
		localization,
		prefix,
		defaultMask,
		alwaysDefaultMask,
	);

	const flags = {};

	const inputNumber = value ? (value as string).replace(/\D/g, "") : "";

	const guessSelectedCountry = memoize(() => {
		// if enableAreaCodes == false, try to search in hidden area codes to detect area code correctly
		// then search and insert main country which has this area code
		// https://github.com/bl00mber/react-phone-input-2/issues/201
		if (enableAreaCodes === false) {
			let mainCode;
			hiddenAreaCodes.some((country) => {
				if (startsWith(inputNumber, country.dialCode)) {
					onlyCountries.some((o) => {
						if (country.iso2 === o.iso2 && o.mainCode) {
							mainCode = o;
							return true;
						}
					});
					return true;
				}
			});
			if (mainCode) return mainCode;
		}

		const secondBestGuess = onlyCountries.find((o) => o.iso2 === defaultCountry);
		if (inputNumber.trim() === "") return secondBestGuess;

		const bestGuess = onlyCountries.reduce(
			(selectedCountry, country) => {
				if (startsWith(inputNumber, country.dialCode)) {
					if (country.dialCode.length > selectedCountry.dialCode.length) {
						return country;
					}
					if (
						country.dialCode.length === selectedCountry.dialCode.length &&
						country.priority < selectedCountry.priority
					) {
						return country;
					}
				}
				return selectedCountry;
			},
			{ dialCode: "", priority: 10001 },
		) as Country;

		if (!bestGuess.name) return secondBestGuess;
		return bestGuess;
	});

	let countryGuess: AreaItem | null = null;
	if (disableInitialCountryGuess) {
		countryGuess = null;
	} else if (inputNumber.length > 1) {
		// Country detect by phone
		countryGuess = guessSelectedCountry() || null;
	} else if (defaultCountry) {
		// Default country
		countryGuess = onlyCountries.find((o) => o.iso2 === defaultCountry) || null;
	} else {
		// Empty params
		countryGuess = null;
	}

	const dialCode =
		inputNumber.length < 2 && countryGuess && !startsWith(inputNumber, countryGuess.dialCode)
			? countryGuess.dialCode
			: "";

	let formattedNumber: string;
	const text = `${disableCountryCode ? "" : dialCode}${inputNumber}`;
	if (inputNumber === "" && countryGuess === null) {
		formattedNumber = "";
	} else if (countryGuess?.name) {
		const options = {
			prefix,
			disableCountryCode,
			enableAreaCodeStretch,
			enableLongNumbers,
			autoFormat,
		};
		formattedNumber = formatNumber(text, countryGuess, options);
	}

	const dropdownProps = {
		startAdornment: (
			<InputAdornment
				onlyCountries={onlyCountries}
				preferredCountries={preferredCountries}
				flags={flags}
			/>
		),
	};

	return (
		<TextField
			placeholder={placeholder}
			type="tel"
			InputProps={{ ...dropdownProps, ...InputProps }}
			{...restProps}
		/>
	);
};

export default PhoneField;
