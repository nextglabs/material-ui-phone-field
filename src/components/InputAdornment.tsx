import React from "react";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Menu from "@material-ui/core/Menu";
import MuiInputAdornment from "@material-ui/core/InputAdornment";
import NativeSelect from "@material-ui/core/NativeSelect";
import { makeStyles } from "@material-ui/core/styles";
import map from "lodash/map";
import clsx from "clsx";

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
			"& + svg": {
				display: "none",
			},
		},
		nativeSelect: {
			padding: "0!important",
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
	Pick<PhoneFieldProps, "enableSearch" | "localization" | "native"> & {
		inputFlagClasses?: string;
		flags: Record<string, HTMLElement | null>;
		onlyCountries: Country[];
		preferredCountries: Country[];
		handleFlagItemClick: (country: Country | string) => void;
	};

export const InputAdornment = (props: InputAdornmentProps) => {
	const {
		dropdownClass,
		flags = {},
		native,
		handleFlagItemClick,
		inputFlagClasses,
		localization,
		onlyCountries = [],
		preferredCountries = [],
	} = props;
	const classes = useStyles(props);
	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

	const handleItemClick = (country: Country | string) => {
		handleFlagItemClick && handleFlagItemClick(country);
		setAnchorEl(null);
	};

	const handleMenuClose = () => {
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
		onClick: () => handleItemClick(country),
		native,
	});

	const commonDropdownProps = {
		id: "country-menu",
		onClose: handleMenuClose,
	};

	const dropdownContent = (
		<>
			{!!preferredCountries.length &&
				map(preferredCountries, (country, index) => (
					<DropdownItem {...commonDropdownItemProps(country, index)} />
				))}
			{!!preferredCountries.length && !native && <Divider />}

			{map(onlyCountries, (country, index) => (
				<DropdownItem {...commonDropdownItemProps(country, index)} />
			))}
		</>
	);

	return (
		<MuiInputAdornment className={classes.positionStart} position="start">
			{native ? (
				<NativeSelect
					{...commonDropdownProps}
					className={classes.native}
					classes={{
						root: clsx(classes.nativeRoot, inputFlagClasses),
						select: classes.nativeSelect,
					}}
					onChange={(e) => handleItemClick(e.target.value)}
					disableUnderline
				>
					{dropdownContent}
				</NativeSelect>
			) : (
				<>
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
						{...commonDropdownProps}
						className={dropdownClass}
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
					>
						{dropdownContent}
					</Menu>
				</>
			)}
		</MuiInputAdornment>
	);
};
