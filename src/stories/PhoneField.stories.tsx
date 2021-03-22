import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";

import { PhoneField, PhoneFieldProps } from "../";

export default {
	title: "Example/PhoneField",
	component: PhoneField,
} as Meta;

const Template: Story<PhoneFieldProps> = (args) => <PhoneField {...args} />;

export const Standard = Template.bind({});
Standard.args = {
	label: "Standard Input",
	variant: "standard",
};

export const Filled = Template.bind({});
Filled.args = {
	label: "Filled Input",
	variant: "filled",
};

export const Outlined = Template.bind({});
Outlined.args = {
	label: "Outlined Input",
	variant: "outlined",
};
