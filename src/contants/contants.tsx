export const ISDEV_BUILD = process.env.NODE_ENV === "development";

export const BACKEND = ISDEV_BUILD ? "http://localhost:3003/" : "/4familys/";
export const SUBSITE = ISDEV_BUILD ? "" : "/4family/";

export const WEBAPPNAME = "4Family";

export const VERSION = "1.0";