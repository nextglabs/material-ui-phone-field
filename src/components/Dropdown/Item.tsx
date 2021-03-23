import React from "react";
import MenuItem from "@material-ui/core/MenuItem";
import RootRef from "@material-ui/core/RootRef";
import { InternationalDialCode, Iso2Code } from "../../typings";

export interface DropdownItemProps {
	name: string;
	iso2: Iso2Code;
	dialCode: InternationalDialCode;
	itemRef: (instance: any) => void;
	localization?: string;
	native?: boolean;
	selected?: boolean;
}

export const DropdownItem = (props: DropdownItemProps) => {
	const {
		name,
		iso2,
		dialCode,
		localization = null,
		itemRef,
		native = false,
		selected = false,
		...restProps
	} = props;

	if (native) {
		return (
			<option
				className="country"
				data-dial-code="1"
				data-country-code={iso2}
				value={iso2}
				{...restProps}
			>
				{localization || name} {`+${dialCode}`}
			</option>
		);
	}

	return (
		<RootRef rootRef={(node) => itemRef(node)}>
			<MenuItem
				className="country"
				data-dial-code="1"
				data-country-code={iso2}
				selected={selected}
				{...restProps}
			>
				<div className={`flag ${iso2} margin`} />
				<span className="country-name">{localization || name}</span>
				<span className="dial-code">{`+${dialCode}`}</span>
			</MenuItem>
		</RootRef>
	);
};
