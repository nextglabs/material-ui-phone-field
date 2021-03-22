export type CountryName = string;

export type Region =
	| "america"
	| "europe"
	| "asia"
	| "oceania"
	| "africa"
	| "north-america"
	| "south-america"
	| "central-america"
	| "caribbean"
	| "eu-union"
	| "ex-ussr"
	| "ex-yugos"
	| "baltic"
	| "middle-east"
	| "north-africa";

/** A 2-letter code that represents a country or a territory, example (fr: France) */
export type Iso2Code =
	// Countries
	| "af"
	| "al"
	| "dz"
	| "ad"
	| "ao"
	| "ag"
	| "ar"
	| "am"
	| "aw"
	| "au"
	| "at"
	| "az"
	| "bs"
	| "bh"
	| "bd"
	| "bb"
	| "by"
	| "be"
	| "bz"
	| "bj"
	| "bt"
	| "bo"
	| "ba"
	| "bw"
	| "br"
	| "io"
	| "bn"
	| "bg"
	| "bf"
	| "bi"
	| "kh"
	| "cm"
	| "ca"
	| "cv"
	| "bq"
	| "cf"
	| "td"
	| "cl"
	| "cn"
	| "co"
	| "km"
	| "cd"
	| "cg"
	| "cr"
	| "ci"
	| "hr"
	| "cu"
	| "cw"
	| "cy"
	| "cz"
	| "dk"
	| "dj"
	| "dm"
	| "do"
	| "ec"
	| "eg"
	| "sv"
	| "gq"
	| "er"
	| "ee"
	| "et"
	| "fj"
	| "fi"
	| "fr"
	| "gf"
	| "pf"
	| "ga"
	| "gm"
	| "ge"
	| "de"
	| "gh"
	| "gr"
	| "gd"
	| "gp"
	| "gu"
	| "gt"
	| "gn"
	| "gw"
	| "gy"
	| "ht"
	| "hn"
	| "hk"
	| "hu"
	| "is"
	| "in"
	| "id"
	| "ir"
	| "iq"
	| "ie"
	| "il"
	| "it"
	| "jm"
	| "jp"
	| "jo"
	| "kz"
	| "ke"
	| "ki"
	| "xk"
	| "kw"
	| "kg"
	| "la"
	| "lv"
	| "lb"
	| "ls"
	| "lr"
	| "ly"
	| "li"
	| "lt"
	| "lu"
	| "mo"
	| "mk"
	| "mg"
	| "mw"
	| "my"
	| "mv"
	| "ml"
	| "mt"
	| "mh"
	| "mq"
	| "mr"
	| "mu"
	| "mx"
	| "fm"
	| "md"
	| "mc"
	| "mn"
	| "me"
	| "ma"
	| "mz"
	| "mm"
	| "na"
	| "nr"
	| "np"
	| "nl"
	| "nc"
	| "nz"
	| "ni"
	| "ne"
	| "ng"
	| "kp"
	| "no"
	| "om"
	| "pk"
	| "pw"
	| "ps"
	| "pa"
	| "pg"
	| "py"
	| "pe"
	| "ph"
	| "pl"
	| "pt"
	| "pr"
	| "qa"
	| "re"
	| "ro"
	| "ru"
	| "rw"
	| "kn"
	| "lc"
	| "vc"
	| "ws"
	| "sm"
	| "st"
	| "sa"
	| "sn"
	| "rs"
	| "sc"
	| "sl"
	| "sg"
	| "sk"
	| "si"
	| "sb"
	| "so"
	| "za"
	| "kr"
	| "ss"
	| "es"
	| "lk"
	| "sd"
	| "sr"
	| "sz"
	| "se"
	| "ch"
	| "sy"
	| "tw"
	| "tj"
	| "tz"
	| "th"
	| "tl"
	| "tg"
	| "to"
	| "tt"
	| "tn"
	| "tr"
	| "tm"
	| "tv"
	| "ug"
	| "ua"
	| "ae"
	| "gb"
	| "us"
	| "uy"
	| "uz"
	| "vu"
	| "va"
	| "ve"
	| "vn"
	| "ye"
	| "zm"
	| "zw"
	// Regions
	| "as"
	| "ai"
	| "bm"
	| "vg"
	| "ky"
	| "ck"
	| "fk"
	| "fo"
	| "gi"
	| "gl"
	| "je"
	| "ms"
	| "nu"
	| "nf"
	| "mp"
	| "bl"
	| "sh"
	| "mf"
	| "pm"
	| "sx"
	| "tk"
	| "tc"
	| "vi"
	| "wf";

/** International Dial Code for a specific country, example: "1" for USA */
export type InternationalDialCode = string;

/**
 * Format of the phone number.
 * Example: `... .. .. ..` will be used to format the number like: `999 99 99 99`
 */
export type Mask = string;

export type Priority = number;

/** A usually 3-digit number that identifies a particular telephone service area in a country (such as the US, Canada and some other countries) */
export type AreaCode = string;

/**
 * Represents a country or a territory with raw data
 * [
 *    Country name,
 *    Regions,
 *    iso2 code,
 *    International dial code,
 *    Mask (if available),
 *    Order priority (if >1 country with same dial code),
 *    Area codes (if >1 country with same dial code)
 * ]
 */
export type RawCountry = [
	CountryName,
	Region[],
	Iso2Code,
	InternationalDialCode,
	Mask?,
	Priority?,
	AreaCode[]?,
];

/** Represents a Country with specific data */
export type Country = {
	name: string;
	localName: string;
	iso2: Iso2Code;
	regions: Region[];
	dialCode: InternationalDialCode;
	countryCode: string;
	format: string;
	priority: Priority;
	mainCode?: boolean;
	hasAreaCodes?: boolean;
};

export type AreaItem = Country & {
	isAreaCode?: boolean;
	areaCodeLength?: number;
};

/** A list of Iso2 country codes */
export type PartialCountries = Iso2Code[];

/** Priorities by Country, passed as Prop
 * example: priorities={{ ca: 0, us: 1, kz: 0, ru: 1 }}
 */
export type Priorities = Partial<Record<Iso2Code, number>>;

/**
 * Priorities by Country, passed as Prop
 * example: areaCodes={{ gr: ['2694', '2647'], fr: ['369', '463'], us: ['300']}}
 */
export type AreaCodes = Partial<Record<Iso2Code, AreaCode[]>>;

/**
 * Masks by Country, passed as Prop
 * example: masks={{fr: '(...) ..-..-..', at: '(....) ...-....'}}
 */
export type Masks = Partial<Record<Iso2Code, Mask>>;

/** Localization object */
export type Localization = Record<string, string>;

type OrderKey = "onlyCountries" | "preferredCountries";
export type PreserveOrder = [OrderKey, OrderKey] | null;

export type CustomSettings = [Iso2Code, Mask, AreaCode[], Priority];
