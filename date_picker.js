import {$,$$,createElement} from "./dom_utils"
import {inRange} from "./utils.js"
import {MONTH,DAY,daysInMonth,firstDayOfMonth,getMonthNYear,validDateOrNow,to24hrs,to12hrs} from "./date_utils.js"
import {CustomEventHandler} from "./event_handler.js"
import {Dropdown} from "./dropdown.js"

const HTML = {}

export function DatePicker(datepicker) {
	if(!(this instanceof DatePicker)) return new DatePicker(datepicker)
	this.date = validDateOrNow(datepicker.dataset.date)
	this.locale = datepicker.dataset.locale || "en"
	this.monthPicker = createElement("div", {classes: ["month"], innerHTML: HTML.monthNode})
	this.monthTag = this.monthPicker.$("span")
	this.dayPicker = createElement("div", {classes: ["days"], innerHTML: HTML.daysNode})
	this.weekStart = Math.max(DAY.indexOf(datepicker.dataset.weekStart), 0)
	this.days = this.dayPicker.$$(".day");
	[this.hours,this.minutes,this.seconds] = this.monthPicker.$$("[pattern]")
	datepicker.append(this.monthPicker, this.dayPicker)
	Dropdown(datepicker.$(".dropdown"))

	this.setupMonthChangeHandler()
	this.setupHourChangeHandler()
	this.orderDays()
	this.setupUI()
	this.setupHrFormatHandler(datepicker)
}
DatePicker.prototype = new CustomEventHandler("datechange")
DatePicker.prototype.constructor = DatePicker

DatePicker.prototype.setFormattingOptions = function(options) {
	for(const option in options)
		this.formatOptions[option] = options[option]
}
DatePicker.prototype.toString = function() {
	this.formatOptions.hour12 = this.hourFormat != "HR"
	return this.date.toLocaleString(this.locale, this.formatOptions)
}
DatePicker.prototype.setupUI = function() {
	this.buildMonthGUI()
	for(const time of ["hours", "minutes", "seconds"])
		this[time].value = this.date[`get${time.capitalize()}`]().toString().padStart(2,0)
	delete DatePicker.prototype.setupUI
}
DatePicker.prototype.setupDateChangeHandler = function() {
	for(const days of this.days) {
		for(const day of days.$$("label")) {
			const val = day.$("span").innerText
			const input = day.$("input")
			input.on("change", ()=> {
				if(input.checked) {
					this.date = new Date(this.guiDate)
					if(day.classList.contains("othermonth")) {
						const [month,year] = getMonthNYear(this.date.getMonth()+(val>20?-1:1), this.date.getFullYear())
						this.date.setMonth(month)
						this.date.setYear(year)
					}
					this.date.setDate(val)
					this.setValidHour()
				}
			})
		}
	}
}
DatePicker.prototype.clearDays = function() {
	for(const day of this.days)
		for(const label of day.$$("label"))
			label.remove()
}
DatePicker.prototype.buildMonthGUI = function(date = this.date) {
	this.clearDays()
	let month = date.getMonth(), year = date.getFullYear()
	const selMonth = this.date.getMonth(),selYear = this.date.getFullYear(),selDay = this.date.getDate()
	this.monthTag.innerText = `${MONTH[month].capitalize()} ${year}`
	const Month = {
		current: {
			len: daysInMonth(month, year),
			firstDay: firstDayOfMonth(month, year)-this.weekStart
		},
		prev: {
			len: daysInMonth(month-1, year)
		}
	}
	Month.current.firstDay<0&&(Month.current.firstDay += 7)
	let day = Month.prev.len - Month.current.firstDay
	let lastDayOfMonth = (day)=> day > Month.prev.len;
	[month, year] = getMonthNYear(month-1, year)
	let othermonth = 1
	for(let [i,current] = [0,0]; i < 42; ++i&&(current=(current+1)%7)) {
		if(lastDayOfMonth(++day)) {
			[month, year] = getMonthNYear(month+1, year)
			day = 1
			lastDayOfMonth = ()=> day > Month.current.len
			othermonth ^= 1
		}
		const label = dayElem(day, othermonth)
		if(day == selDay&&month==selMonth&&year==selYear)
			label.$("input").setAttribute("checked","")
		this.days[current].append(label)
	}
	this.setupDateChangeHandler()
}
DatePicker.prototype.setValidHour = function() {
	const hr = parseInt(this.hours.value)
	const hrIsValid = !isNaN(hr) && this.hourFormat=="HR"? inRange(hr,0,23) : inRange(hr,1,12)
	if(hrIsValid)
		this.date.setHours(to24hrs(hr, this.hourFormat))
	this.hours.value = this.hourFormat=="HR"? this.date.getHours() : to12hrs(this.date.getHours())
	if(inRange(this.minutes.value,0,59))
		this.date.setMinutes(this.minutes.value)
	this.minutes.value = this.date.getMinutes()
	if(inRange(this.seconds.value,0,59))
		this.date.setSeconds(this.seconds.value)
	this.seconds.value = this.date.getSeconds()
	this.formatTimeInputs()
	this.dispatchEvent("datechange", this.date)
}
DatePicker.prototype.formatTimeInputs = function() {
	for(const time of [this.hours, this.minutes, this.seconds])
		time.value = time.value.padStart(2,0)
}

DatePicker.prototype.setupMonthChangeHandler = function() {
	let i = 1
	this.guiDate = new Date(this.date)
	this.guiDate.setDate(1)
	const [back,fwrd] = this.dayPicker.$$(".day svg")
	back.on("mousedown", ()=> {
		this.guiDate.setMonth(this.guiDate.getMonth()-1)
		this.buildMonthGUI(this.guiDate)
	})
	fwrd.on("mousedown", ()=> {
		this.guiDate.setMonth(this.guiDate.getMonth()+1)
		this.buildMonthGUI(this.guiDate)
	})
	delete DatePicker.prototype.setupMonthChangeHandler
}
DatePicker.prototype.setupHrFormatHandler = function(datepicker) {
	const selectedFormat = datepicker.$(".month .dropdown span")
	const hours = this.date.getHours()
	const shouldSelect = datepicker.dataset.hour12 != undefined?
		hours > 12? format=> format == "PM" : format=> format == "AM" : format=> format == "HR"
	for(const hourFormat of datepicker.$$("[name=h-format]")) {
		hourFormat.on("change", ()=> {
			hourFormat.checked&&(this.hourFormat = selectedFormat.innerText = hourFormat.value)
			this.setValidHour()
		})
		if(shouldSelect(hourFormat.value)) {
			hourFormat.checked = true
			hourFormat.dispatchEvent(new Event("change"))
		}
	}
	this.formatOptions = {
		weekday: "long",
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: this.hourFormat != "HR"
	}
	delete DatePicker.prototype.setupHrFormatHandler
}
DatePicker.prototype.setupHourChangeHandler = function() {
	for(const time of [this.hours,this.minutes,this.seconds]) {
		time.on("change", ()=> {
			this.setValidHour()
		})
	}
	delete DatePicker.prototype.setupHourChangeHandler
}
DatePicker.prototype.orderDays = function() {
	let i = this.weekStart
	for(const day of this.days) {
		day.append(createElement("span", {innerHTML: `<span>${DAY[i].capitalize()}</span>`}))
		++i==7&&(i=0)
	}
	delete DatePicker.prototype.buildDaysGUI
}

function dayElem(day, othermonth) {
	const label = createElement("label", {children: [
		createElement("input", {attrs: {type: "radio", name: "day"}}),
		createElement("span", {innerText: day})
	]})
	othermonth&&label.classList.add("othermonth")
	return label
}



HTML.monthNode =
	"<span></span>"+
	"<div>"+
		"<input type=\"tel\" pattern=\"[0-9]*\">".repeat(3)+
		"<div class=\"dropdown\">"+
			"<span>HR</span>"+
			"<ul>"+
				"<label><li>Hour Format</li></label>"+
				"<div class=\"scroll\">"+["HR","AM","PM"].reduce((html,hr)=> html+=
					`<label><input type="radio" value=${hr} name="h-format"><li>${hr}</li></label>`,"")+
				"</div>"+
			"</ul>"+
		"</div>"+
	"</div>"

HTML.daysNode =
	"<div class=\"day\"></div>".repeat(5)+
	"<div class=\"day\">"+
		"<svg viewBox=\"0 0 64 32\"><path d=\"M0 32 l32 -32 l32 32 h-8 L32 8 l-24 24z\"/></svg>"+
	"</div>"+
	"<div class=\"day\">"+
		"<svg viewBox=\"0 0 64 32\"><path d=\"M0 0 L32 32 L64 0 h-8 L32 24 L8 0z\"/></svg>"+
	"</div>"