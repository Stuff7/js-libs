export const MONTH = ["january", "february", "march", "april", "may", "june",
											"july", "august", "september", "october", "november", "december"]
export const DAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

export function daysInMonth(month, year) {
	return new Date(year, month+1, 0).getDate()
}
export function firstDayOfMonth(month, year) {
	return new Date(year, month, 1).getDay()
}
export function getMonthNYear(month,year) {
	if(month < 0) return [11,year-1]
	else if(month > 11) return [0,year+1]
	return [month, year]
}
export function validDateOrNow(date) {
	return isNaN(Date.parse(date))? new Date() : new Date(date)
}
export function to24hrs(hr,format) {
	if(format == "AM")
		return hr==12? 0 : hr
	if(format == "PM")
		return hr==12? hr : hr+12
	return hr
}
export function to12hrs(hr) {
	if(!hr) return 12
	return hr <= 12? hr : hr-12
}