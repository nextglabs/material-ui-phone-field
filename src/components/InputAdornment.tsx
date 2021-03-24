import React from "react";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Menu from "@material-ui/core/Menu";
import MuiInputAdornment from "@material-ui/core/InputAdornment";
// import NativeSelect from "@material-ui/core/NativeSelect";
import { makeStyles } from "@material-ui/core/styles";
import map from "lodash/map";

import { DropdownItem } from "./Dropdown/Item";
import { Country } from "../typings";
import { PhoneFieldProps, PhoneFieldStyles } from "..";

const useStyles = makeStyles(
	{
		flagButton: {
			minWidth: 30,
			padding: 0,
			height: 30,
		},
		native: {
			width: 30,
			height: 30,
			padding: 8,
		},
		nativeRoot: {
			padding: 0,

			"& + svg": {
				display: "none",
			},
		},
		nativeSelect: {
			padding: 0,
			lineHeight: 0,
			height: 11,
		},
		positionStart: {
			position: "relative",
		},
	},
	{ name: "MuiPhoneField" },
);

export type InputAdornmentProps = PhoneFieldStyles &
	Pick<PhoneFieldProps, "enableSearch" | "localization"> & {
		inputFlagClasses?: string;
		flags: Record<string, HTMLElement | null>;
		onlyCountries: Country[];
		preferredCountries: Country[];
		handleFlagItemClick: (country: Country, e: any) => void;
	};

export const InputAdornment = (props: InputAdornmentProps) => {
	const {
		dropdownClass,
		flags = {},
		handleFlagItemClick,
		inputFlagClasses,
		localization,
		// native = false,
		onlyCountries = [],
		preferredCountries = [],
	} = props;
	const classes = useStyles(props);
	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

	const handleItemClick = (country: Country, event: React.MouseEvent) => {
		handleFlagItemClick && handleFlagItemClick(country, event);
		setAnchorEl(null);
	};

	const commonDropdownItemProps = (country: Country, index: number) => ({
		key: `preferred_${country.iso2}_${index}`,
		name: country.name,
		iso2: country.iso2,
		dialCode: country.dialCode,
		// selected: isSelected(country),
		localization: localization && localization[country.name],
		itemRef: (node: HTMLElement) => {
			flags[`flag_no_${index}`] = node;
		},
		onClick: (event: React.MouseEvent) => handleItemClick(country, event),
	});

	return (
		<MuiInputAdornment className={classes.positionStart} position="start">
			<Button
				disableRipple
				className={classes.flagButton}
				// aria-owns={anchorEl ? "country-menu" : null}
				aria-label="Select country"
				onClick={(e) => setAnchorEl(e.currentTarget)}
				aria-haspopup
			>
				<div className={inputFlagClasses} />
			</Button>
			<Menu
				className={dropdownClass}
				id="country-menu"
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
			>
				{!!preferredCountries.length && (
					<>
						{map(preferredCountries, (country, index) => (
							<DropdownItem {...commonDropdownItemProps(country, index)} />
						))}
						<Divider />
					</>
				)}

				{map(onlyCountries, (country, index) => (
					<DropdownItem {...commonDropdownItemProps(country, index)} />
				))}
			</Menu>
		</MuiInputAdornment>
	);
};
