/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import trim from "lodash/trim";
import find from "lodash/find";
import head from "lodash/head";
import tail from "lodash/tail";
import debounce from "lodash/debounce";
import memoize from "lodash/memoize";
import reduce from "lodash/reduce";
import startsWith from "lodash/startsWith";
import clsx from "clsx";
import { TextField, TextFieldProps } from "@material-ui/core";

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
import { isCountry } from "./utils";
import { InputAdornment } from "./components/InputAdornment";

import "./styles/default.scss";

const keys = {
	UP: 38,
	DOWN: 40,
	RIGHT: 39,
	LEFT: 37,
	ENTER: 13,
	ESC: 27,
	PLUS: 43,
	A: 65,
	Z: 90,
	SPACE: 32,
	TAB: 9,
};

export interface PhoneInputEventsProps {
	onChange?(
		value: string,
		data: Country | Record<string, unknown>,
		event: React.ChangeEvent<HTMLInputElement>,
		formattedValue: string,
	): void;
	onFocus?(
		event: React.FocusEvent<HTMLInputElement>,
		data: Country | Record<string, unknown>,
	): void;
	onBlur?(
		event: React.FocusEvent<HTMLInputElement>,
		data: Country | Record<string, unknown>,
	): void;
	onClick?(
		event: React.MouseEvent<HTMLInputElement>,
		data: Country | Record<string, unknown>,
	): void;
	onKeyDown?(event: React.KeyboardEvent<HTMLInputElement>): void;
	onEnterKeyPress?(event: React.KeyboardEvent<HTMLInputElement>): void;
	isValid?:
		| ((value: string, country: Country | undefined, countries: Country[]) => boolean | string)
		| boolean;
}

export type PhoneFieldStyles = {
	containerStyle?: React.CSSProperties;
	inputStyle?: React.CSSProperties;
	buttonStyle?: React.CSSProperties;
	dropdownStyle?: React.CSSProperties;
	searchStyle?: React.CSSProperties;

	containerClass?: string;
	inputClass?: string;
	buttonClass?: string;
	dropdownClass?: string;
	searchClass?: string;
};

export type PhoneFieldProps = TextFieldProps &
	PhoneFieldStyles &
	PhoneInputEventsProps & {
		/**
		 * Allows to always use default mask
		 * @default false
		 */
		alwaysDefaultMask?: boolean;
		/** Specifies custom area codes for country codes, example: `areaCodes={{gr: ['2694', '2647'], fr: ['369', '463'], us: ['300']}}` */
		areaCodes?: AreaCodes;
		/**
		 * Enables country search auto-completion
		 * @default false
		 */
		autocompleteSearch?: boolean;
		/**
		 * Auto-formats phone numbers
		 * @default true
		 */
		autoFormat?: boolean;
		/**
		 * Copy just the numbers
		 * @default true
		 */
		copyNumbersOnly?: boolean;
		/**
		 * Specifies if country code is editable
		 * @default true
		 */
		countryCodeEditable?: boolean;
		/**
		 * Specifies the default country
		 * @default "us"
		 */
		defaultCountry?: Iso2Code;
		/**
		 * Default error message that should be displayed when the phone number is invalid
		 * @default ""
		 */
		defaultErrorMessage?: string;
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
		 * Disables country guessing
		 * @default false
		 */
		disableCountryGuess?: boolean;
		/**
		 * Disables countries dropdown
		 * @default false
		 */
		disableDropdown?: boolean;
		/**
		 * Disables initial country guess
		 * @default false
		 */
		disableInitialCountryGuess?: boolean;
		/**
		 * @default false
		 */
		disableSearchIcon?: boolean;
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
		 * Adds a mousedown event listener to close the dropdown when user clicks away
		 * @default true
		 */
		enableClickOutside?: boolean;
		/**
		 * Allow phone numbers with more than 15 digits
		 * @default false
		 */
		enableLongNumbers?: boolean;
		/**
		 * Enables country search
		 * @default
		 */
		enableSearch?: boolean;
		/**
		 * Enables dependent territories with population of ~100,000 or lower
		 * @default false
		 */
		enableTerritories?: boolean;
		/** Country codes to be excluded from the dropdown list `excludeCountries={['cu','cw','kz']}` */
		excludeCountries?: PartialCountries;
		/**
		 * Jump cursor to end of the input
		 * @default true
		 */
		jumpCursorToEnd?: boolean;
		/** Specifies predefined or custom localization */
		localization?: Localization;
		/** Specifies custom masks for country codes, example: `masks={{fr: '(...) ..-..-..', at: '(....) ...-....'}}` */
		masks?: Masks;
		/** Country codes to be included, ie: `onlyCountries={['cu','cw','kz']}` */
		onlyCountries?: PartialCountries;
		/** Country codes to be at the top of the dropdown list `preferredCountries={['cu','cw','kz']}` */
		preferredCountries?: PartialCountries;
		/**
		 * Specifies the country code prefix
		 * @default "+"
		 */
		prefix?: string;
		/** Specifies user-defined order */
		preserveOrder?: PreserveOrder;
		/** Specifies custom priority for country codes, example: `priority={{ca: 0, us: 1, kz: 0, ru: 1}}` */
		priority?: Priorities;
		/**
		 * Used to display countries only from specified regions
		 * @default null
		 */
		regions?: Region | Region[] | null;
		/**
		 * Renders string as a flag
		 * @default ""
		 */
		renderStringAsFlag?: string;
		/**
		 * Text that should be displayed when no search results are found
		 * @default "No entries to show"
		 */
		searchNotFoundText?: string;
		/**
		 * Placeholder text of the search input
		 * @default "search"
		 */
		searchPlaceholderText?: string;
		/**
		 * Shows dropdown by default
		 * @default open
		 */
		showDropdown?: boolean;
		/**
		 * Shows additional special label
		 * @default "Phone"
		 */
		specialLabel?: string;
	};

export type PhoneFieldState = {
	debouncedQueryStingSearcher: ReturnType<typeof debounce>;
	defaultCountry?: Iso2Code;
	formattedNumber: string;
	freezeSelection: boolean;
	hiddenAreaCodes: Country[];
	highlightCountryIndex: number;
	onlyCountries: Country[];
	placeholder: string;
	preferredCountries: Country[];
	queryString: string;
	searchValue: string;
	selectedCountry?: Country;
	showDropdown: boolean;
};

export class PhoneField extends React.Component<PhoneFieldProps, PhoneFieldState> {
	dropdownRef: HTMLElement | null = null;
	dropdownContainerRef: HTMLElement | null = null;
	inputRef: HTMLInputElement | null = null;
	flags: Record<string, HTMLElement | null> = {};

	static defaultProps: Partial<PhoneFieldProps> = {
		alwaysDefaultMask: false,
		// areaCodes: null,
		autoFormat: true,
		buttonClass: "",
		buttonStyle: {},
		containerClass: "",
		containerStyle: {},
		copyNumbersOnly: true,
		defaultCountry: "us",
		countryCodeEditable: true,
		defaultMask: "... ... ... ... ..",
		disableCountryCode: false,
		disableCountryGuess: false,
		disableDropdown: false,
		disableInitialCountryGuess: false,
		disableSearchIcon: false,
		dropdownClass: "",
		dropdownStyle: {},
		enableAreaCodes: false,
		enableLongNumbers: false,
		enableSearch: false,
		enableTerritories: false,
		excludeCountries: [],
		inputClass: "",
		inputProps: {},
		inputStyle: {},
		localization: {},
		// masks: null,
		onlyCountries: [],
		placeholder: "1 (702) 123-4567",
		preferredCountries: [],
		prefix: "+",
		preserveOrder: null,
		// priority: null,
		// regions: null,
		searchClass: "",
		searchNotFoundText: "No entries to show",
		searchPlaceholderText: "search",
		searchStyle: {},
		value: "",
	};

	constructor(props: PhoneFieldProps) {
		super(props);
		const { onlyCountries, preferredCountries, hiddenAreaCodes } = new CountryData(
			props.enableAreaCodes,
			props.enableTerritories,
			props.regions,
			props.onlyCountries,
			props.preferredCountries,
			props.excludeCountries,
			props.preserveOrder,
			props.masks,
			props.priority,
			props.areaCodes,
			props.localization,
			props.prefix,
			props.defaultMask,
			props.alwaysDefaultMask,
		);

		const inputNumber = props.value ? (props.value as string).replace(/\D/g, "") : "";

		let countryGuess: AreaItem | undefined;
		if (props.disableInitialCountryGuess) {
			countryGuess = undefined;
		} else if (inputNumber.length > 1) {
			// Country detect by phone
			countryGuess =
				this.guessSelectedCountry(
					inputNumber.substring(0, 6),
					onlyCountries,
					props.defaultCountry,
				) || undefined;
		} else if (props.defaultCountry) {
			// Default country
			countryGuess = onlyCountries.find((o) => o.iso2 == props.defaultCountry) || undefined;
		} else {
			// Empty params
			countryGuess = undefined;
		}

		let dialCode = "";
		let formattedNumber = "";

		if (isCountry(countryGuess)) {
			if (inputNumber.length < 2 && !startsWith(inputNumber, countryGuess.dialCode)) {
				dialCode = countryGuess.dialCode;
			}

			formattedNumber = this.formatNumber(
				(props.disableCountryCode ? "" : dialCode) + inputNumber,
				countryGuess.name ? countryGuess.format : undefined,
			);
		}

		const highlightCountryIndex = onlyCountries.findIndex((o) => o == countryGuess);

		this.state = {
			debouncedQueryStingSearcher: debounce(this.searchCountry, 250),
			formattedNumber,
			freezeSelection: false,
			hiddenAreaCodes,
			highlightCountryIndex,
			onlyCountries,
			placeholder: props.placeholder || "",
			preferredCountries,
			queryString: "",
			searchValue: "",
			selectedCountry: countryGuess,
			showDropdown: props.showDropdown || false,
		};
	}

	componentDidMount() {
		if (document.addEventListener && this.props.enableClickOutside) {
			// FIXME: remove ts-ignore and fix TS error
			// @ts-ignore
			document.addEventListener("mousedown", this.handleClickOutside);
		}
	}

	componentWillUnmount() {
		if (document.removeEventListener && this.props.enableClickOutside) {
			// FIXME: remove ts-ignore and fix TS error
			// @ts-ignore
			document.removeEventListener("mousedown", this.handleClickOutside);
		}
	}

	componentDidUpdate(prevProps: PhoneFieldProps) {
		if (prevProps.defaultCountry !== this.props.defaultCountry) {
			this.updateDefaultCountry(this.props.defaultCountry);
		} else if (prevProps.value !== this.props.value) {
			this.updateFormattedNumber(this.props.value as string);
		}
	}

	getProbableCandidate = memoize((queryString) => {
		if (!queryString || queryString.length === 0) {
			return null;
		}
		// don't include the preferred countries in search
		const probableCountries = this.state.onlyCountries.filter((country) => {
			return startsWith(country.name.toLowerCase(), queryString.toLowerCase());
		}, this);
		return probableCountries[0];
	});

	guessSelectedCountry = memoize(
		(inputNumber: string, onlyCountries: Country[], defaultCountry: Iso2Code | undefined) => {
			const secondBestGuess = find(onlyCountries, { iso2: defaultCountry }) || undefined;
			if (trim(inputNumber) === "") return secondBestGuess;

			const bestGuess = reduce(
				onlyCountries,
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
			) as AreaItem;

			if (!bestGuess.name) return secondBestGuess;
			return bestGuess;
		},
	);

	// Hooks for updated props
	updateDefaultCountry = (country: Iso2Code | undefined) => {
		const { onlyCountries } = this.state;
		const { disableCountryCode } = this.props;

		const newSelectedCountry = find(onlyCountries, { iso2: country });

		this.setState({
			defaultCountry: country,
			selectedCountry: newSelectedCountry,
			formattedNumber: disableCountryCode ? "" : `+${newSelectedCountry?.dialCode || "1"}`,
		});
	};

	updateFormattedNumber = (number: string) => {
		const { onlyCountries, defaultCountry } = this.state;
		const { disableCountryCode } = this.props;

		let countryGuess: AreaItem | undefined;
		let inputNumber = number;
		let formattedNumber = number;

		// if inputNumber does not start with '+', then use default country's dialing prefix,
		// otherwise use logic for finding country based on country prefix.
		if (!inputNumber.startsWith("+")) {
			countryGuess = find(onlyCountries, { iso2: defaultCountry }) as AreaItem;
			const dialCode =
				countryGuess && !startsWith(inputNumber.replace(/\D/g, ""), countryGuess.dialCode)
					? countryGuess.dialCode
					: "";
			formattedNumber = this.formatNumber(
				(disableCountryCode ? "" : dialCode) + inputNumber.replace(/\D/g, ""),
				countryGuess ? countryGuess.format : undefined,
			);
		} else {
			inputNumber = inputNumber.replace(/\D/g, "");
			countryGuess = this.guessSelectedCountry(
				inputNumber.substring(0, 6),
				onlyCountries,
				defaultCountry,
			);
			formattedNumber = this.formatNumber(inputNumber, countryGuess?.format);
		}

		this.setState({ selectedCountry: countryGuess, formattedNumber });
	};

	// View methods
	scrollTo = (country: HTMLElement | null, middle = false) => {
		if (!country) return;
		const container = this.dropdownRef;
		if (!container || !document.body) return;

		const containerHeight = container.offsetHeight;
		const containerOffset = container.getBoundingClientRect();
		const containerTop = containerOffset.top + document.body.scrollTop;
		const containerBottom = containerTop + containerHeight;

		const element = country;
		const elementOffset = element.getBoundingClientRect();

		const elementHeight = element.offsetHeight;
		const elementTop = elementOffset.top + document.body.scrollTop;
		const elementBottom = elementTop + elementHeight;

		let newScrollTop = elementTop - containerTop + container.scrollTop;
		const middleOffset = containerHeight / 2 - elementHeight / 2;

		if (this.props.enableSearch ? elementTop < containerTop + 32 : elementTop < containerTop) {
			// scroll up
			if (middle) {
				newScrollTop -= middleOffset;
			}
			container.scrollTop = newScrollTop;
		} else if (elementBottom > containerBottom) {
			// scroll down
			if (middle) {
				newScrollTop += middleOffset;
			}
			const heightDifference = containerHeight - elementHeight;
			container.scrollTop = newScrollTop - heightDifference;
		}
	};

	scrollToTop = () => {
		const container = this.dropdownRef;
		if (!container || !document.body) return;
		container.scrollTop = 0;
	};

	formatNumber = (text: string, format?: string): string => {
		const { disableCountryCode, enableLongNumbers, autoFormat, prefix = "+" } = this.props;

		let pattern;
		if (disableCountryCode && format) {
			pattern = format.split(" ");
			pattern.shift();
			pattern = pattern.join(" ");
		} else {
			pattern = format;
		}

		if (!text || text.length === 0) {
			return disableCountryCode ? "" : prefix;
		}

		// for all strings with length less than 3, just return it (1, 2 etc.)
		// also return the same text if the selected country has no fixed format
		if ((text && text.length < 2) || !pattern || !autoFormat) {
			return disableCountryCode ? text : `${prefix}${text}`;
		}

		const formattedObject = reduce(
			pattern,
			(acc, character) => {
				if (acc.remainingText.length === 0) {
					return acc;
				}

				if (character !== ".") {
					return {
						formattedText: acc.formattedText + character,
						remainingText: acc.remainingText,
					};
				}

				return {
					formattedText: acc.formattedText + head(acc.remainingText),
					remainingText: tail(acc.remainingText),
				};
			},
			{
				formattedText: "",
				remainingText: text.split(""),
			},
		);

		let formattedNumber;
		if (enableLongNumbers) {
			formattedNumber =
				formattedObject.formattedText + formattedObject.remainingText.join("");
		} else {
			formattedNumber = formattedObject.formattedText;
		}

		// Always close brackets
		if (formattedNumber.includes("(") && !formattedNumber.includes(")")) formattedNumber += ")";
		return formattedNumber;
	};

	// Put the cursor to the end of the input (usually after a focus event)
	cursorToEnd = () => {
		const input = this.inputRef;
		if (input) {
			input.focus();
			let len = input.value.length;
			if (input.value.charAt(len - 1) === ")") len = len - 1;
			input.setSelectionRange(len, len);
		}
	};

	getElement = (index: number) => this.flags[`flag_no_${index}`];

	// return country data from state
	getCountryData = () => {
		if (!this.state.selectedCountry) return {};
		return {
			name: this.state.selectedCountry.name || "",
			dialCode: this.state.selectedCountry.dialCode || "",
			countryCode: this.state.selectedCountry.iso2 || "",
			format: this.state.selectedCountry.format || "",
		};
	};

	handleFlagDropdownClick = (
		e: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLElement>,
	) => {
		e.preventDefault();
		if (!this.state.showDropdown && this.props.disabled) return;
		const { preferredCountries, selectedCountry } = this.state;
		const allCountries = preferredCountries.concat(this.state.onlyCountries);

		const highlightCountryIndex = allCountries.findIndex(
			(o) => o.dialCode === selectedCountry?.dialCode && o.iso2 === selectedCountry.iso2,
		);

		this.setState(
			{
				showDropdown: !this.state.showDropdown,
				highlightCountryIndex,
			},
			() => {
				if (this.state.showDropdown) {
					this.scrollTo(this.getElement(this.state.highlightCountryIndex));
				}
			},
		);
	};

	handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		const { prefix = "+", onChange } = this.props;

		let formattedNumber = this.props.disableCountryCode ? "" : prefix;
		let newSelectedCountry = this.state.selectedCountry;
		let freezeSelection = this.state.freezeSelection;

		if (!this.props.countryCodeEditable) {
			const mainCode = newSelectedCountry?.hasAreaCodes
				? this.state.onlyCountries.find(
						(o) => o.iso2 === newSelectedCountry?.iso2 && o.mainCode,
				  )?.dialCode
				: newSelectedCountry?.dialCode;

			const updatedInput = `${prefix}${mainCode}`;
			if (value.slice(0, updatedInput.length) !== updatedInput) return;
		}

		if (value === prefix) {
			// we should handle change when we delete the last digit
			if (onChange) onChange("", this.getCountryData(), e, "");
			return this.setState({ formattedNumber: "" });
		}

		// Does exceed default 15 digit phone number limit
		if (value.replace(/\D/g, "").length > 15) {
			if (this.props.enableLongNumbers === false) return;
			if (typeof this.props.enableLongNumbers === "number") {
				if (value.replace(/\D/g, "").length > this.props.enableLongNumbers) return;
			}
		}

		// if the input is the same as before, must be some special key like enter etc.
		if (value === this.state.formattedNumber) return;

		// ie hack
		if (e.preventDefault) {
			e.preventDefault();
		} else {
			// TODO: FIXME:
			// @ts-ignore
			e.returnValue = false;
		}

		const { defaultCountry } = this.props;
		const { onlyCountries, selectedCountry } = this.state;

		if (onChange) e.persist();

		if (value.length > 0) {
			// before entering the number in new format, lets check if the dial code now matches some other country
			const inputNumber = value.replace(/\D/g, "");

			// we don't need to send the whole number to guess the country... only the first 6 characters are enough
			// the guess country function can then use memoization much more effectively since the set of input it
			// gets has drastically reduced
			if (
				!this.state.freezeSelection ||
				(selectedCountry?.dialCode && selectedCountry.dialCode.length > inputNumber.length)
			) {
				if (this.props.disableCountryGuess) {
					newSelectedCountry = selectedCountry;
				} else {
					newSelectedCountry = this.guessSelectedCountry(
						inputNumber.substring(0, 6),
						onlyCountries,
						defaultCountry,
					);
				}
				freezeSelection = false;
			}
			formattedNumber = this.formatNumber(inputNumber, newSelectedCountry?.format);
			newSelectedCountry = newSelectedCountry?.dialCode
				? newSelectedCountry
				: selectedCountry;
		}

		let caretPosition = e.target.selectionStart || 0;
		const oldFormattedText = this.state.formattedNumber;
		const diff = formattedNumber.length - oldFormattedText.length;

		this.setState(
			{
				formattedNumber,
				freezeSelection,
				selectedCountry: newSelectedCountry,
			},
			() => {
				if (diff > 0) {
					caretPosition = caretPosition - diff;
				}

				const lastChar = formattedNumber.charAt(formattedNumber.length - 1);

				if (lastChar == ")") {
					this.inputRef?.setSelectionRange(
						formattedNumber.length - 1,
						formattedNumber.length - 1,
					);
				} else if (caretPosition > 0 && oldFormattedText.length >= formattedNumber.length) {
					this.inputRef?.setSelectionRange(caretPosition, caretPosition);
				}

				onChange &&
					onChange(
						formattedNumber.replace(/[^0-9]+/g, ""),
						this.getCountryData(),
						e,
						formattedNumber,
					);
			},
		);
	};

	handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
		this.setState({ showDropdown: false });
		if (this.props.onClick) this.props.onClick(e, this.getCountryData());
	};

	handleDoubleClick = (e: React.MouseEvent<HTMLInputElement>) => {
		// TODO: the following lines have been changed from e.target to e.currentTarget to satisfy TS error
		// Check if this is correct.
		const len = e.currentTarget.value.length;
		e.currentTarget.setSelectionRange(0, len);
	};

	handleFlagItemClick = (country: Country, e: any) => {
		const currentSelectedCountry = this.state.selectedCountry;
		const newSelectedCountry = this.state.onlyCountries.find((o) => o == country);
		if (!newSelectedCountry) return;

		const unformattedNumber = this.state.formattedNumber
			.replace(" ", "")
			.replace("(", "")
			.replace(")", "")
			.replace("-", "");
		const newNumber =
			unformattedNumber.length > 1
				? unformattedNumber.replace(
						currentSelectedCountry?.dialCode || "",
						newSelectedCountry.dialCode,
				  )
				: newSelectedCountry.dialCode;
		const formattedNumber = this.formatNumber(
			newNumber.replace(/\D/g, ""),
			newSelectedCountry?.format,
		);

		this.setState(
			{
				showDropdown: false,
				selectedCountry: newSelectedCountry,
				freezeSelection: true,
				formattedNumber,
			},
			() => {
				this.cursorToEnd();
				if (this.props.onChange)
					this.props.onChange(
						formattedNumber.replace(/[^0-9]+/g, ""),
						this.getCountryData(),
						e,
						formattedNumber,
					);
			},
		);
	};

	handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		// if the input is blank, insert dial code of the selected country
		if (this.inputRef) {
			if (
				this.inputRef.value === this.props.prefix &&
				isCountry(this.state.selectedCountry) &&
				!this.props.disableCountryCode
			) {
				this.setState(
					{
						formattedNumber: this.props.prefix + this.state.selectedCountry.dialCode,
					},
					() => {
						this.props.jumpCursorToEnd && setTimeout(this.cursorToEnd, 0);
					},
				);
			}
		}

		this.setState({ placeholder: "" });

		this.props.onFocus && this.props.onFocus(e, this.getCountryData());
		this.props.jumpCursorToEnd && setTimeout(this.cursorToEnd, 0);
	};

	handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		if (!e.target.value) this.setState({ placeholder: this.props.placeholder || "" });
		this.props.onBlur && this.props.onBlur(e, this.getCountryData());
	};

	handleInputCopy = (e: React.ClipboardEvent<HTMLInputElement>) => {
		if (!this.props.copyNumbersOnly) return;
		const selection = window.getSelection() || "";
		const text = selection.toString().replace(/[^0-9]+/g, "") || "";
		e.clipboardData.setData("text/plain", text);
		e.preventDefault();
	};

	getHighlightCountryIndex = (direction: number) => {
		// had to write own function because underscore does not have findIndex. lodash has it
		const highlightCountryIndex = this.state.highlightCountryIndex + direction;

		if (
			highlightCountryIndex < 0 ||
			highlightCountryIndex >=
				this.state.onlyCountries.length + this.state.preferredCountries.length
		) {
			return highlightCountryIndex - direction;
		}

		if (
			this.props.enableSearch &&
			highlightCountryIndex > this.getSearchFilteredCountries().length
		)
			return 0; // select first country
		return highlightCountryIndex;
	};

	searchCountry = () => {
		const probableCandidate =
			this.getProbableCandidate(this.state.queryString) || this.state.onlyCountries[0];
		const probableCandidateIndex =
			this.state.onlyCountries.findIndex((o) => o == probableCandidate) +
			this.state.preferredCountries.length;

		this.scrollTo(this.getElement(probableCandidateIndex), true);

		this.setState({ queryString: "", highlightCountryIndex: probableCandidateIndex });
	};

	handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const {
			// TODO: the following line have been changed from e.target to e.currentTarget to satisfy TS error
			// Check if this is correct.
			currentTarget: { blur, className, value },
			// TODO: FIXME: event.which is deprecated, we should use event.key instead.
			which,
		} = e;

		if (className.includes("selected-flag") && which === keys.ENTER && !this.state.showDropdown)
			return this.handleFlagDropdownClick(e);
		if (className.includes("form-control") && (which === keys.ENTER || which === keys.ESC))
			return blur();

		if (!this.state.showDropdown || this.props.disabled) return;
		if (className.includes("search-box")) {
			if (which !== keys.UP && which !== keys.DOWN && which !== keys.ENTER) {
				if (which === keys.ESC && value === "") {
					// do nothing // if search field is empty, pass event (close dropdown)
				} else {
					return; // don't process other events coming from the search field
				}
			}
		}

		// ie hack
		if (e.preventDefault) {
			e.preventDefault();
		} else {
			// TODO: FIXME:
			// @ts-ignore
			e.returnValue = false;
		}

		const moveHighlight = (direction: number) => {
			this.setState(
				{
					highlightCountryIndex: this.getHighlightCountryIndex(direction),
				},
				() => {
					this.scrollTo(this.getElement(this.state.highlightCountryIndex), true);
				},
			);
		};

		switch (e.which) {
			case keys.DOWN:
				moveHighlight(1);
				break;
			case keys.UP:
				moveHighlight(-1);
				break;
			case keys.ENTER:
				if (this.props.enableSearch) {
					this.handleFlagItemClick(
						this.getSearchFilteredCountries()[this.state.highlightCountryIndex] ||
							this.getSearchFilteredCountries()[0],
						e,
					);
				} else {
					this.handleFlagItemClick(
						[...this.state.preferredCountries, ...this.state.onlyCountries][
							this.state.highlightCountryIndex
						],
						e,
					);
				}
				break;
			case keys.ESC:
			case keys.TAB:
				this.setState(
					{
						showDropdown: false,
					},
					this.cursorToEnd,
				);
				break;
			default:
				if ((e.which >= keys.A && e.which <= keys.Z) || e.which === keys.SPACE) {
					this.setState(
						{
							queryString: this.state.queryString + String.fromCharCode(e.which),
						},
						this.state.debouncedQueryStingSearcher,
					);
				}
		}
	};

	handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const { onEnterKeyPress, onKeyDown } = this.props;
		if (e.which === keys.ENTER) {
			if (onEnterKeyPress) onEnterKeyPress(e);
		}
		if (onKeyDown) onKeyDown(e);
	};

	handleClickOutside = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
		if (this.dropdownRef && !this.dropdownContainerRef?.contains(e.currentTarget)) {
			this.state.showDropdown && this.setState({ showDropdown: false });
		}
	};

	handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {
			currentTarget: { value: searchValue },
		} = e;
		const { preferredCountries, selectedCountry } = this.state;
		let highlightCountryIndex = 0;

		if (searchValue === "" && selectedCountry) {
			const { onlyCountries } = this.state;
			highlightCountryIndex = preferredCountries
				.concat(onlyCountries)
				.findIndex((o) => o == selectedCountry);
			// wait asynchronous search results re-render, then scroll
			setTimeout(() => this.scrollTo(this.getElement(highlightCountryIndex)), 100);
		}
		this.setState({ searchValue, highlightCountryIndex });
	};

	getDropdownCountryName = (country: Country) => country.localName || country.name;

	getSearchFilteredCountries = () => {
		const { preferredCountries, onlyCountries, searchValue } = this.state;
		const { enableSearch } = this.props;
		const allCountries = preferredCountries.concat(onlyCountries);
		const sanitizedSearchValue = searchValue.trim().toLowerCase();
		if (enableSearch && sanitizedSearchValue) {
			// [...new Set()] to get rid of duplicates
			// firstly search by iso2 code
			if (/^\d+$/.test(sanitizedSearchValue)) {
				// contains digits only
				// values wrapped in ${} to prevent undefined
				return allCountries.filter(({ dialCode }) =>
					[`${dialCode}`].some((field) =>
						field.toLowerCase().includes(sanitizedSearchValue),
					),
				);
			} else {
				const iso2countries = allCountries.filter(({ iso2 }) =>
					[`${iso2}`].some((field) => field.toLowerCase().includes(sanitizedSearchValue)),
				);
				// TODO: FIXME: || "" - is a fix to prevent search of "undefined" strings
				// Since all the other values shouldn't be undefined, this fix was accept
				// but the structure do not looks very good
				const searchedCountries = allCountries.filter(({ name, localName }) =>
					[`${name}`, `${localName || ""}`].some((field) =>
						field.toLowerCase().includes(sanitizedSearchValue),
					),
				);
				this.scrollToTop();
				return [...new Set(([] as Country[]).concat(iso2countries, searchedCountries))];
			}
		} else {
			return allCountries;
		}
	};

	getCountryDropdownList = () => {
		const { preferredCountries, highlightCountryIndex, showDropdown, searchValue } = this.state;
		const { disableDropdown, prefix } = this.props;
		const {
			enableSearch,
			searchNotFoundText,
			disableSearchIcon,
			searchClass,
			searchStyle,
			searchPlaceholderText,
			autocompleteSearch,
		} = this.props;

		const searchedCountries = this.getSearchFilteredCountries();

		const countryDropdownList = searchedCountries.map((country, index) => {
			const highlight = highlightCountryIndex === index;
			const itemClasses = clsx({
				country: true,
				preferred: country.iso2 === "us" || country.iso2 === "gb",
				active: country.iso2 === "us",
				highlight,
			});

			const inputFlagClasses = `flag ${country.iso2}`;

			return (
				<li
					ref={(el) => (this.flags[`flag_no_${index}`] = el)}
					key={`flag_no_${index}`}
					data-flag-key={`flag_no_${index}`}
					className={itemClasses}
					data-dial-code="1"
					tabIndex={disableDropdown ? -1 : 0}
					data-country-code={country.iso2}
					onClick={(e) => this.handleFlagItemClick(country, e)}
					role="option"
					{...(highlight ? { "aria-selected": true } : {})}
				>
					<div className={inputFlagClasses} />
					<span className="country-name">{this.getDropdownCountryName(country)}</span>
					<span className="dial-code">
						{country.format
							? this.formatNumber(country.dialCode, country.format)
							: prefix + country.dialCode}
					</span>
				</li>
			);
		});

		const dashedLi = <li key="dashes" className="divider" />;
		// let's insert a dashed line in between preferred countries and the rest
		preferredCountries.length > 0 &&
			(!enableSearch || (enableSearch && !searchValue.trim())) &&
			countryDropdownList.splice(preferredCountries.length, 0, dashedLi);

		const dropDownClasses = clsx(this.props.dropdownClass, "country-list", {
			hide: !showDropdown,
		});

		return (
			<ul
				ref={(el) => {
					!enableSearch && el && el.focus();
					return (this.dropdownRef = el);
				}}
				className={dropDownClasses}
				style={this.props.dropdownStyle}
				role="listbox"
				tabIndex={0}
			>
				{enableSearch && (
					<li className={clsx(searchClass, "search")}>
						{!disableSearchIcon && (
							<span
								className={clsx({
									"search-emoji": true,
									[`${searchClass}-emoji`]: searchClass,
								})}
								role="img"
								aria-label="Magnifying glass"
							>
								&#128270;
							</span>
						)}
						<input
							className={clsx({
								"search-box": true,
								[`${searchClass}-box`]: searchClass,
							})}
							style={searchStyle}
							type="search"
							placeholder={searchPlaceholderText}
							autoFocus={true}
							autoComplete={autocompleteSearch ? "on" : "off"}
							value={searchValue}
							onChange={this.handleSearchChange}
						/>
					</li>
				)}
				{countryDropdownList.length > 0 ? (
					countryDropdownList
				) : (
					<li className="no-entries-message">
						<span>{searchNotFoundText}</span>
					</li>
				)}
			</ul>
		);
	};

	render() {
		const {
			onlyCountries,
			preferredCountries,
			selectedCountry,
			showDropdown,
			formattedNumber,
		} = this.state;
		const {
			disableDropdown,
			renderStringAsFlag,
			isValid,
			defaultErrorMessage,
			specialLabel,
			placeholder,
			InputProps,
			value,
			...restProps
		} = this.props;

		let isValidValue, errorMessage;
		if (typeof isValid === "boolean") {
			isValidValue = isValid;
		} else {
			const isValidProcessed =
				isValid &&
				isValid(formattedNumber.replace(/\D/g, ""), selectedCountry, onlyCountries);
			if (typeof isValidProcessed === "boolean") {
				isValidValue = isValidProcessed;
				if (isValidValue === false) errorMessage = defaultErrorMessage;
			} else {
				// typeof === 'string'
				isValidValue = false;
				errorMessage = isValidProcessed;
			}
		}

		const containerClasses = clsx(this.props.containerClass, "react-tel-input");
		const arrowClasses = clsx({ arrow: true, up: showDropdown });
		const inputClasses = clsx(this.props.inputClass, "form-control", {
			"invalid-number": !isValidValue,
			open: showDropdown,
		});

		const selectedFlagClasses = clsx("selected-flag", {
			open: showDropdown,
		});
		const flagViewClasses = clsx(this.props.buttonClass, "flag-dropdown", {
			"invalid-number": !isValidValue,
			open: showDropdown,
		});

		const dropdownProps = {
			startAdornment: (
				<InputAdornment
					onlyCountries={onlyCountries}
					preferredCountries={preferredCountries}
					flags={this.flags}
					handleFlagItemClick={this.handleFlagItemClick}
					inputFlagClasses={`flag ${selectedCountry?.iso2}`}
				/>
			),
		};

		return (
			<TextField
				placeholder={placeholder}
				onChange={this.handleInput}
				onClick={this.handleInputClick}
				onDoubleClick={this.handleDoubleClick}
				onFocus={this.handleInputFocus}
				onBlur={this.handleInputBlur}
				onCopy={this.handleInputCopy}
				value={formattedNumber || value}
				inputRef={(el) => (this.inputRef = el)}
				onKeyDown={this.handleInputKeyDown}
				disabled={this.props.disabled}
				type="tel"
				InputProps={{
					...dropdownProps,
					...InputProps,
				}}
				{...restProps}
			/>
		);
	}
}
